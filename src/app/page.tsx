"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/components/app-store-provider"
import { supabase } from "@/lib/supabase"
import type { StudentProfile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowRight, CheckCircle2, Pill, Sparkles } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { setProfile } = useAppStore()

  const [nim, setNim] = useState("")
  const [name, setName] = useState("")
  const [pharmacyName, setPharmacyName] = useState("")
  const [preceptorName, setPreceptorName] = useState("")
  const [period, setPeriod] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null)

  const handleCheckNim = async () => {
    const cleanNim = nim.trim()
    if (!cleanNim || !supabase) return

    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("nim", cleanNim)
        .maybeSingle()

      if (data && !error) {
        setIsExistingUser(true)
        setName(data.name || "")
        setPharmacyName(data.pharmacy_name || data.pharmacy || "")
        setPreceptorName(data.preceptor_name || data.preceptor || "")
        setPeriod(data.period || "")
      } else {
        setIsExistingUser(false)
      }
    } catch (err) {
      console.warn("Cek NIM:", err)
      setIsExistingUser(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    const cleanNim = nim.trim()
    const cleanName = name.trim()

    if (!cleanNim) {
      setErrorMsg("Harap masukkan NIM.")
      return
    }

    if (!cleanName && isExistingUser === false) {
      setErrorMsg("Harap masukkan nama lengkap untuk akun baru.")
      return
    }

    setIsLoading(true)

    try {
      let activeProfile: StudentProfile | null = null

      if (supabase) {
        const { data: existingStudent } = await supabase
          .from("students")
          .select("*")
          .eq("nim", cleanNim)
          .maybeSingle()

        if (existingStudent) {
          activeProfile = {
            id: existingStudent.id,
            name: existingStudent.name || cleanName,
            nim: existingStudent.nim,
            pharmacyName: existingStudent.pharmacy_name || existingStudent.pharmacy || pharmacyName,
            preceptorName: existingStudent.preceptor_name || existingStudent.preceptor || preceptorName,
            period: existingStudent.period || period,
            role: existingStudent.role || (cleanNim.toUpperCase() === "ADMIN001" ? "admin" : "student"),
          }
        } else {
          const newId = crypto.randomUUID()
          const newRole = cleanNim.toUpperCase() === "ADMIN001" ? "admin" : "student"

          const { data: createdStudent, error: insertError } = await supabase
            .from("students")
            .insert({
              id: newId,
              name: cleanName || `Mahasiswa ${cleanNim}`,
              nim: cleanNim,
              pharmacy_name: pharmacyName,
              preceptor_name: preceptorName,
              period: period,
              role: newRole,
            })
            .select()
            .single()

          if (insertError) {
            console.error("Gagal simpan mahasiswa baru:", insertError)
          }

          activeProfile = {
            id: createdStudent?.id || newId,
            name: cleanName || `Mahasiswa ${cleanNim}`,
            nim: cleanNim,
            pharmacyName,
            preceptorName,
            period,
            role: newRole,
          }
        }
      } else {
        activeProfile = {
          id: `local-${cleanNim}`,
          name: cleanName || `Mahasiswa ${cleanNim}`,
          nim: cleanNim,
          pharmacyName,
          preceptorName,
          period,
          role: cleanNim.toUpperCase() === "ADMIN001" ? "admin" : "student",
        }
      }

      if (activeProfile) {
        await setProfile(activeProfile)
        router.push("/learning")
      }
    } catch (err: any) {
      console.error("Login submit error:", err)
      setErrorMsg(err?.message || "Terjadi kesalahan saat masuk. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-[85vh] flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <Pill className="size-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <Sparkles className="size-3.5" />
              Sistem Pembelajaran PKPA
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Masuk pembelajaran
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Isi nama lengkap dan NIM. Jika NIM sudah terdaftar, catatan Anda akan dimuat. Jika belum, akun mahasiswa baru akan dibuat.
            </p>
          </div>
        </div>

        {/* Form Login Bebas Kotak Peringatan */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="nim">Nomor Induk Mahasiswa (NIM)</Label>
            <Input
              id="nim"
              value={nim}
              onChange={(e) => {
                setNim(e.target.value)
                setIsExistingUser(null)
              }}
              onBlur={handleCheckNim}
              placeholder="Contoh: 09121998 atau ADMIN001"
              required
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground">
              Masukkan NIM untuk memuat logbook otomatis.
            </p>
          </div>

          {isExistingUser === true && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-700">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>Akun ditemukan: <strong>{name}</strong></span>
            </div>
          )}

          {(isExistingUser === false || isExistingUser === null) && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama sesuai kartu mahasiswa"
                  required={isExistingUser === false}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pharmacy">Wahana / Apotek PKPA (Opsional)</Label>
                <Input
                  id="pharmacy"
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  placeholder="Contoh: RSUD / Apotek Kimia Farma"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="preceptor">Preseptor (Opsional)</Label>
                  <Input
                    id="preceptor"
                    value={preceptorName}
                    onChange={(e) => setPreceptorName(e.target.value)}
                    placeholder="Nama Pembimbing"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="period">Periode (Opsional)</Label>
                  <Input
                    id="period"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="Contoh: 2026"
                  />
                </div>
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 mt-2"
          >
            <span>{isLoading ? "Memproses..." : "Masuk ke Pembelajaran"}</span>
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </div>
    </main>
  )
}
