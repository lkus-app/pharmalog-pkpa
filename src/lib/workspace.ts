import { supabase } from "@/lib/supabase"
import type { AppData, DrugNotes, StudentProfile } from "@/lib/types"
import { DEFAULT_APP_DATA, sanitizeNotes } from "@/lib/storage"

export async function fetchWorkspace(studentId: string): Promise<AppData | null> {
  if (!supabase || !studentId) return null

  try {
    // 1. Ambil Profil Mahasiswa
    const { data: student } = await supabase
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
    const { data: progressList } = await supabase
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
    const { data: favList } = await supabase
      .from("favorites")
      .select("drug_id")
      .eq("student_id", studentId)

    const favorites = (favList || []).map((f) => f.drug_id)

    // 4. Ambil Riwayat Dilihat
    const { data: recentList } = await supabase
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
  if (!supabase || !profile.id) return
  await supabase.from("students").upsert({
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
  if (!supabase || !studentId || !drugId) return
  await supabase.from("drug_progress").upsert(
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
  if (!supabase || !studentId || !drugId) return
  if (isFav) {
    await supabase.from("favorites").upsert(
      { student_id: studentId, drug_id: drugId },
      { onConflict: "student_id,drug_id" }
    )
  } else {
    await supabase.from("favorites").delete().match({ student_id: studentId, drug_id: drugId })
  }
}

export async function saveDrugView(studentId: string, drugId: string, therapyId: string) {
  if (!supabase || !studentId || !drugId) return
  await supabase.from("recent_drugs").upsert(
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
  if (!supabase || !studentId) return
  await supabase.from("drug_progress").delete().eq("student_id", studentId)
  await supabase.from("favorites").delete().eq("student_id", studentId)
  await supabase.from("recent_drugs").delete().eq("student_id", studentId)
}
