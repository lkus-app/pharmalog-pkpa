"use client"

import { useState } from "react"
import { useAppStore } from "@/components/app-store-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { downloadJson } from "@/lib/storage"
import { AlertCircle, Download, FileUp, ShieldAlert, CheckCircle2 } from "lucide-react"

export function AdminView() {
  const { isAdmin, exportBackup, importBackup, resetData } = useAppStore()
  const [backupJson, setBackupJson] = useState("")
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-5" />
              <CardTitle className="text-lg">Akses Dibatasi</CardTitle>
            </div>
            <CardDescription>
              Halaman ini hanya dapat diakses oleh akun dengan hak akses Administrator (NIM: ADMIN001).
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  function handleExport() {
    const raw = exportBackup()
    try {
      const parsed = JSON.parse(raw)
      downloadJson(parsed, `pharmalog_pkpa_backup_${new Date().toISOString().slice(0, 10)}.json`)
    } catch {
      // fallback
    }
  }

  async function handleImport() {
    if (!backupJson.trim()) return
    setIsProcessing(true)
    setImportStatus(null)
    try {
      const ok = await importBackup(backupJson.trim())
      if (ok) {
        setImportStatus("Data cadangan berhasil dipulihkan!")
        setBackupJson("")
      } else {
        setImportStatus("Format JSON tidak valid.")
      }
    } catch (err: any) {
      setImportStatus(err?.message || "Gagal mengimpor data cadangan")
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleReset() {
    setIsProcessing(true)
    try {
      await resetData()
      setResetConfirm(false)
      setImportStatus("Seluruh progres belajar berhasil dibersihkan.")
    } catch (err: any) {
      setImportStatus(err?.message || "Gagal mereset data.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Panel Administrasi PKPA</h1>
        <p className="text-sm text-muted-foreground">
          Kelola pencadangan, pemulihan data, dan pemeliharaan sistem PharmaLog PKPA.
        </p>
      </div>

      {importStatus ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{importStatus}</span>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Ekspor Cadangan */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="size-5 text-emerald-600" />
              <CardTitle className="text-base">Ekspor Cadangan</CardTitle>
            </div>
            <CardDescription>
              Unduh seluruh catatan, progres belajar, dan data profil ke dalam berkas JSON.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              Unduh JSON Cadangan
            </Button>
          </CardContent>
        </Card>

        {/* Impor Cadangan */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileUp className="size-5 text-blue-600" />
              <CardTitle className="text-base">Impor Cadangan</CardTitle>
            </div>
            <CardDescription>
              Tempelkan teks format JSON dari berkas cadangan untuk memulihkan data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              className="h-24 w-full rounded-md border p-2 text-xs font-mono"
              placeholder="Tempelkan isi file JSON di sini..."
              value={backupJson}
              onChange={(e) => setBackupJson(e.target.value)}
            />
            <Button
              onClick={handleImport}
              disabled={!backupJson.trim() || isProcessing}
              variant="outline"
              className="w-full"
            >
              {isProcessing ? "Memproses..." : "Pulihkan Data"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Zona Bahaya / Reset Data */}
      <Card className="border-rose-200">
        <CardHeader>
          <div className="flex items-center gap-2 text-rose-600">
            <ShieldAlert className="size-5" />
            <CardTitle className="text-base">Zona Berbahaya</CardTitle>
          </div>
          <CardDescription>
            Tindakan di bawah ini akan menghapus semua catatan, riwayat baca, dan progres mahasiswa saat ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!resetConfirm ? (
            <Button
              variant="destructive"
              onClick={() => setResetConfirm(true)}
              disabled={isProcessing}
            >
              Reset Semua Progres Pembelajaran
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="destructive"
                onClick={handleReset}
                disabled={isProcessing}
              >
                {isProcessing ? "Mereset..." : "Ya, Hapus Sekarang"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setResetConfirm(false)}
                disabled={isProcessing}
              >
                Batal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
