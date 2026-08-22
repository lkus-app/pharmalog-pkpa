"use client"

import { Database, HardDrive, LoaderCircle, Pill } from "lucide-react"
import { useState, type FormEvent } from "react"
import { useAppStore } from "@/components/app-store-provider"
import { MedicalDisclaimer } from "@/components/shared/medical-disclaimer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { APP_NAME, APP_SUBTITLE } from "@/lib/constants"

export function IdentityGate() {
  const { enter, configured } = useAppStore()
  const [name, setName] = useState("")
  const [nim, setNim] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError("")

    const cleanName = name.trim()
    const cleanNim = nim.trim()

    if (!cleanName || !cleanNim) {
      setError("Nama lengkap dan NIM wajib diisi.")
      return
    }

    setSubmitting(true)
    try {
      await enter(cleanName, cleanNim)
    } catch (err: any) {
      console.error("[PharmaLog Login Error]", err)
      setError(err?.message || "Gagal masuk. Coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Pill className="size-6" />
            </span>
            <div>
              <p className="text-lg font-bold text-slate-900">{APP_NAME}</p>
              <p className="text-xs text-muted-foreground">{APP_SUBTITLE}</p>
            </div>
          </div>

          <h1 className="text-xl font-bold text-slate-900">Masuk Pembelajaran</h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Masukkan nama dan NIM Anda untuk melanjutkan pembelajaran atau melihat portofolio klinis PKPA.
          </p>

          <div className="mt-4 flex items-center gap-2 rounded-lg border bg-slate-50 px-3 py-2 text-xs">
            {configured ? (
              <>
                <Database className="size-3.5 text-emerald-600 shrink-0" />
                <span className="text-emerald-700 font-medium">Mode Cloud (Supabase Terhubung)</span>
              </>
            ) : (
              <>
                <HardDrive className="size-3.5 text-blue-600 shrink-0" />
                <span className="text-slate-600">Mode Penyimpanan Lokal (Data tersimpan di browser)</span>
              </>
            )}
          </div>

          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="gate-name" className="text-xs font-semibold text-slate-700">Nama Lengkap</Label>
              <Input
                id="gate-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Contoh: Budi Santoso, S.Farm"
                className="h-10 text-sm"
                autoComplete="name"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gate-nim" className="text-xs font-semibold text-slate-700">NIM / ID Mahasiswa</Label>
              <Input
                id="gate-nim"
                value={nim}
                onChange={(event) => setNim(event.target.value)}
                placeholder="Contoh: 2101010123"
                className="h-10 text-sm"
                autoComplete="username"
                required
              />
            </div>

            {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}

            <Button
              type="submit"
              className="h-10 w-full bg-emerald-600 hover:bg-emerald-700 font-semibold"
              disabled={submitting}
            >
              {submitting ? <LoaderCircle className="animate-spin mr-2 size-4" /> : null}
              {submitting ? "Memproses..." : "Masuk ke Pembelajaran"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-[11px] text-muted-foreground">
              Tip: Gunakan NIM <strong>ADMIN001</strong> untuk masuk sebagai Admin PKPA.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <MedicalDisclaimer compact />
        </div>
      </div>
    </div>
  )
}
