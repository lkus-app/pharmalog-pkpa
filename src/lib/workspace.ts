import { getSupabaseClient } from "@/lib/supabase"
import type { AppData, DrugNotes, StudentProfile } from "@/lib/types"
import { DEFAULT_APP_DATA, sanitizeNotes } from "@/lib/storage"

export async function fetchWorkspace(studentId: string): Promise<AppData | null> {
  const client = getSupabaseClient()
  if (!client || !studentId) return null

  try {
    // 1. Ambil Profil Mahasiswa
    const { data: student } = await client
      .from("students")
      .select("*")
      .eq("id", studentId)
      .maybeSingle()

    if (!student) return null

    const profile: StudentProfile = {
      id: student.id,
      name: student.name,
      nim: student.nim,
      pharmacyName: student.pharmacy_name || student.pharmacy || "",
      preceptorName: student.preceptor_name || student.preceptor || "",
      period: student.period || "",
      role: student.role || "student",
    }

    // 2. Ambil Catatan Obat
    const { data: progressList } = await client
      .from("drug_progress")
      .select("*")
      .eq("student_id", studentId)

    const entries: Record<string, any> = {}
    if (progressList) {
      for (const item of progressList) {
        entries[item.drug_id] = {
          notes: sanitizeNotes(item.notes),
          markedComplete: Boolean(item.is_completed),
          updatedAt: item.updated_at || new Date().toISOString(),
        }
      }
    }

    // 3. Ambil Favorit
    const { data: favList } = await client
      .from("favorites")
      .select("drug_id")
      .eq("student_id", studentId)

    const favorites = (favList || []).map((f) => f.drug_id)

    // 4. Ambil Riwayat Dilihat
    const { data: recentList } = await client
      .from("recent_drugs")
      .select("drug_id, therapy_id, viewed_at")
      .eq("student_id", studentId)
      .order("viewed_at", { ascending: false })
      .limit(20)

    const recent = (recentList || []).map((r) => ({
      drugId: r.drug_id,
      therapyId: r.therapy_id || "",
      viewedAt: r.viewed_at,
    }))

    return {
      profile,
      entries,
      favorites,
      recent,
    }
  } catch (err) {
    console.error("Gagal fetchWorkspace:", err)
    return null
  }
}

export async function saveStudentProfile(profile: StudentProfile) {
  const client = getSupabaseClient()
  if (!client || !profile.id) return
  await client.from("students").upsert({
    id: profile.id,
    name: profile.name,
    nim: profile.nim,
    pharmacy_name: profile.pharmacyName,
    preceptor_name: profile.preceptorName,
    period: profile.period,
    role: profile.role || "student",
    updated_at: new Date().toISOString(),
  })
}

export async function saveDrugNotes({
  studentId,
  therapyId,
  drugId,
  notes,
  completed,
}: {
  studentId: string
  therapyId: string
  drugId: string
  notes: DrugNotes
  completed: boolean
}) {
  const client = getSupabaseClient()
  if (!client || !studentId || !drugId) return
  await client.from("drug_progress").upsert(
    {
      student_id: studentId,
      therapy_id: therapyId,
      drug_id: drugId,
      notes,
      is_completed: completed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,drug_id" }
  )
}

export async function saveFavorite(studentId: string, drugId: string, isFav: boolean) {
  const client = getSupabaseClient()
  if (!client || !studentId || !drugId) return
  if (isFav) {
    await client.from("favorites").upsert(
      { student_id: studentId, drug_id: drugId },
      { onConflict: "student_id,drug_id" }
    )
  } else {
    await client.from("favorites").delete().match({ student_id: studentId, drug_id: drugId })
  }
}

export async function saveDrugView(studentId: string, drugId: string, therapyId: string) {
  const client = getSupabaseClient()
  if (!client || !studentId || !drugId) return
  await client.from("recent_drugs").upsert(
    {
      student_id: studentId,
      drug_id: drugId,
      therapy_id: therapyId,
      viewed_at: new Date().toISOString(),
    },
    { onConflict: "student_id,drug_id" }
  )
}

export async function resetStudentLearning(studentId: string) {
  const client = getSupabaseClient()
  if (!client || !studentId) return
  await client.from("drug_progress").delete().eq("student_id", studentId)
  await client.from("favorites").delete().eq("student_id", studentId)
  await client.from("recent_drugs").delete().eq("student_id", studentId)
}

export interface StudentSubmission {
  profile: StudentProfile
  entries: Record<string, any>
  completedDrugsCount: number
  filledNotesCount: number
  lastUpdated: string
}

export async function fetchAllStudentsWithInputs(): Promise<StudentSubmission[]> {
  const client = getSupabaseClient()
  if (!client) return []

  try {
    // 1. Ambil semua mahasiswa non-admin
    const { data: students, error: studentError } = await client
      .from("students")
      .select("*")
      .neq("role", "admin")
      .neq("nim", "ADMIN001")
      .order("name", { ascending: true })

    if (studentError || !students) {
      console.error("Gagal mengambil data mahasiswa:", studentError)
      return []
    }

    // 2. Ambil seluruh data drug_progress
    const { data: allProgress, error: progError } = await client
      .from("drug_progress")
      .select("*")

    if (progError) {
      console.error("Gagal mengambil progress obat:", progError)
    }

    const progressByStudent: Record<string, Record<string, any>> = {}

    if (allProgress) {
      for (const item of allProgress) {
        if (!progressByStudent[item.student_id]) {
          progressByStudent[item.student_id] = {}
        }
        progressByStudent[item.student_id][item.drug_id] = {
          notes: sanitizeNotes(item.notes),
          markedComplete: Boolean(item.is_completed),
          updatedAt: item.updated_at || new Date().toISOString(),
        }
      }
    }

    const result: StudentSubmission[] = students.map((s) => {
      const studentEntries = progressByStudent[s.id] || {}
      let completedCount = 0
      let filledCount = 0

      for (const drugId of Object.keys(studentEntries)) {
        const entry = studentEntries[drugId]
        if (entry.markedComplete) completedCount++
        const notes = entry.notes || {}
        if (
          notes.indication ||
          notes.dosage ||
          notes.dose ||
          notes.usage ||
          notes.sideEffects ||
          notes.contraindications ||
          notes.interactions ||
          notes.specialInstructions ||
          notes.patientEducation ||
          notes.education
        ) {
          filledCount++
        }
      }

      return {
        profile: {
          id: s.id,
          name: s.name,
          nim: s.nim,
          pharmacyName: s.pharmacy_name || s.pharmacy || "-",
          preceptorName: s.preceptor_name || s.preceptor || "-",
          period: s.period || "-",
          role: s.role || "student",
        },
        entries: studentEntries,
        completedDrugsCount: completedCount,
        filledNotesCount: filledCount,
        lastUpdated: s.updated_at || s.created_at || new Date().toISOString(),
      }
    })

    return result
  } catch (e) {
    console.error("Error fetchAllStudentsWithInputs:", e)
    return []
  }
}

