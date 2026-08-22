"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/components/app-store-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowRight, CheckCircle2, Pill, Sparkles } from "lucide-react"

export function LoginView() {
  const router = useRouter()
  const { enter } = useAppStore()
  const [nim, setNim] = useState("")
  const [name, setName] = useState("")
  const [pharmacyName, setPharmacyName] = useState("")
  const [preceptorName, setPreceptorName] = useState("")
  const [period, setPeriod] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    const cleanNim = nim.trim()
    const cleanName = name.trim()

    if (!cleanNim) {
      setErrorMsg("Harap masukkan NIM.")
      return
    }

    setIsLoading(true)
    try {
      await enter(
        cleanName || `Mahasiswa ${cleanNim}`,
        cleanNim,
        pharmacyName,
        preceptorName,
        period
      )
      router.push("/learning")
    } catch (err: any) {
      console.error("Login submit error:", err)
      setErrorMsg(err?.message || "Terjadi kesalahan saat masuk. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
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
              Masuk Pembelajaran
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Isi nama lengkap dan NIM untuk memulai atau melanjutkan catatan portofolio klinis Anda.
            </p>
          </div>
        </div>

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
              onChange={(e) => setNim(e.target.value)}
              placeholder="Contoh: 2101010123 atau ADMIN001"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap Anda"
              required
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
    </div>
  )
}
