"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useAppStore } from "@/components/app-store-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { downloadJson } from "@/lib/storage"
import { fetchAllStudentsWithInputs, type StudentSubmission } from "@/lib/workspace"
import { generateStudentPdf, generateAllStudentsPdf, formatStudentFilename } from "@/lib/pdf-report"
import { getAllDrugs, THERAPIES } from "@/lib/therapies"
import { SupabaseConfigModal } from "@/components/shared/supabase-config-modal"
import {
  AlertCircle,
  Download,
  FileText,
  FileUp,
  ShieldAlert,
  CheckCircle2,
  Users,
  Search,
  RefreshCw,
  Eye,
  Database,
  GraduationCap,
  Calendar,
  Building,
  Check,
  X,
  Printer,
  Pill,
  BookOpen,
} from "lucide-react"

export function AdminView() {
  const { data, isAdmin, isCloudConnected, exportBackup, importBackup, resetData } = useAppStore()
  const [students, setStudents] = useState<StudentSubmission[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [generatingText, setGeneratingText] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<StudentSubmission | null>(null)
  const [modalFilter, setModalFilter] = useState<"filled" | "all">("filled")
  const [modalDrugSearch, setModalDrugSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Status & backup state
  const [backupJson, setBackupJson] = useState("")
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const totalAllDrugs = useMemo(() => getAllDrugs().length, [])

  const loadStudents = async () => {
    setIsLoadingStudents(true)
    try {
      const fetched = await fetchAllStudentsWithInputs()
      if (fetched && fetched.length > 0) {
        setStudents(fetched)
      } else {
        // Jika belum ada di database atau mode lokal, tampilkan data mahasiswa aktif jika bukan admin
        if (data?.profile && data.profile.nim !== "ADMIN001" && data.profile.role !== "admin") {
          const entryValues = Object.values(data.entries || {}) as any[]
          const completedCount = entryValues.filter((e) => e?.markedComplete).length
          const filledCount = entryValues.filter(
            (e) =>
              e?.notes?.indication ||
              e?.notes?.dosage ||
              e?.notes?.sideEffects ||
              e?.notes?.contraindications ||
              e?.notes?.specialInstructions ||
              e?.notes?.interactions
          ).length

          setStudents([
            {
              profile: data.profile,
              entries: data.entries || {},
              completedDrugsCount: completedCount,
              filledNotesCount: filledCount,
              lastUpdated: new Date().toISOString(),
            },
          ])
        } else {
          setStudents([])
        }
      }
    } catch (err) {
      console.error("Gagal memuat data mahasiswa:", err)
    } finally {
      setIsLoadingStudents(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadStudents()
    }
  }, [isAdmin, isCloudConnected])

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students
    const q = searchQuery.toLowerCase()
    return students.filter(
      (s) =>
        s.profile.name.toLowerCase().includes(q) ||
        s.profile.nim.toLowerCase().includes(q) ||
        (s.profile.pharmacyName && s.profile.pharmacyName.toLowerCase().includes(q))
    )
  }, [students, searchQuery])

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

  // Unduh PDF untuk Satu Mahasiswa dengan nama Nama_NIM.pdf
  const handleDownloadSinglePdf = async (student: StudentSubmission) => {
    setIsGeneratingPdf(true)
    const targetFilename = formatStudentFilename(student.profile, "pdf")
    setGeneratingText(`Menyiapkan Dokumen PDF: ${targetFilename}...`)
    try {
      await generateStudentPdf(student, targetFilename)
    } catch (err) {
      console.error("Gagal cetak PDF mahasiswa:", err)
      alert("Gagal membuat PDF. Silakan coba kembali.")
    } finally {
      setIsGeneratingPdf(false)
      setGeneratingText("")
    }
  }

  // Unduh Rekap Semua Mahasiswa dalam Satu PDF
  const handleDownloadAllPdf = async () => {
    if (students.length === 0) {
      alert("Belum ada data inputan mahasiswa untuk diunduh.")
      return
    }
    setIsGeneratingPdf(true)
    const targetFilename = `Rekapitulasi_PKPA_Semua_Mahasiswa_${new Date().toISOString().slice(0, 10)}.pdf`
    setGeneratingText(`Menyiapkan Rekap Seluruh Mahasiswa (${students.length} Mahasiswa)...`)
    try {
      await generateAllStudentsPdf(students, targetFilename)
    } catch (err) {
      console.error("Gagal cetak rekap PDF semua mahasiswa:", err)
      alert("Gagal membuat PDF rekapitulasi.")
    } finally {
      setIsGeneratingPdf(false)
      setGeneratingText("")
    }
  }

  function handleExportJson() {
    const raw = exportBackup()
    try {
      const parsed = JSON.parse(raw)
      downloadJson(parsed, `pharmalog_pkpa_backup_${new Date().toISOString().slice(0, 10)}.json`)
    } catch {
      // fallback
    }
  }

  async function handleImportJson() {
    if (!backupJson.trim()) return
    setIsProcessing(true)
    setImportStatus(null)
    try {
      const ok = await importBackup(backupJson.trim())
      if (ok) {
        setImportStatus("Data cadangan berhasil dipulihkan!")
        setBackupJson("")
        await loadStudents()
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
      await loadStudents()
    } catch (err: any) {
      setImportStatus(err?.message || "Gagal mereset data.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Overlay status saat men-generate PDF */}
      {isGeneratingPdf && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-xs text-white p-6">
          <div className="flex flex-col items-center gap-4 bg-white text-slate-900 p-8 rounded-2xl shadow-2xl max-w-sm text-center border">
            <RefreshCw className="size-10 animate-spin text-emerald-600" />
            <div>
              <h4 className="font-bold text-base">Membuat Dokumen PDF</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {generatingText || "Sedang memproses tata letak dan grafik dokumen..."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header & Status Supabase Cloud */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Panel Pengelola &amp; Pembimbing PKPA
            </h1>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">Admin</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Pantau hasil inputan lembar kerja klinis, unduh berkas evaluasi dalam format PDF, dan kelola sinkronisasi cloud.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="gap-1.5 text-xs text-slate-700"
          >
            <Database className="size-3.5 text-emerald-600" />
            <span>Koneksi Supabase</span>
          </Button>
        </div>
      </div>

      {importStatus && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* SEKSI UTAMA: REKAPITULASI & DOWNLOAD PDF INPUTAN MAHASISWA */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/60 border-b pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <Users className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">
                  Hasil Inputan Lembar Kerja Mahasiswa PKPA
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Unduh seluruh lembar kerja parameter klinis obat mahasiswa dalam format dokumen PDF resmi.
                </CardDescription>
              </div>
            </div>

            {/* Tombol Unduh PDF Semua Mahasiswa */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadStudents}
                disabled={isLoadingStudents}
                className="gap-1.5 text-xs text-slate-700"
              >
                <RefreshCw className={`size-3.5 ${isLoadingStudents ? "animate-spin" : ""}`} />
                <span>Segarkan Data</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={handleDownloadAllPdf}
                disabled={isGeneratingPdf || students.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs shadow-sm"
              >
                <FileText className="size-4" />
                <span>Unduh Rekap Semua Mahasiswa (PDF)</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Search & Statistik Ringkas */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama mahasiswa, NIM, atau apotek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Total Mahasiswa Terdaftar:</span>
              <Badge variant="outline" className="font-bold text-slate-800">
                {students.length} Mahasiswa
              </Badge>
            </div>
          </div>

          {/* Tabel Mahasiswa */}
          {isLoadingStudents ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="size-6 animate-spin text-emerald-600" />
                <p className="text-xs text-muted-foreground">Memuat data mahasiswa &amp; logbook...</p>
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center bg-slate-50/50">
              <Users className="size-10 text-slate-400 mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">Belum Ada Data Mahasiswa</h3>
              <p className="text-xs text-muted-foreground max-w-md mt-1">
                {isCloudConnected
                  ? "Mahasiswa yang telah masuk dan menyimpan logbook akan otomatis muncul di sini."
                  : "Sambungkan Cloud Supabase untuk melihat dan mengunduh data mahasiswa lintas perangkat."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-slate-100/75 text-slate-700 font-semibold">
                    <th className="p-3 text-center w-12">No</th>
                    <th className="p-3">Mahasiswa</th>
                    <th className="p-3">Wahana PKPA &amp; Pembimbing</th>
                    <th className="p-3 text-center">Progres Selesai</th>
                    <th className="p-3 text-center">Catatan Klinis</th>
                    <th className="p-3 text-right">Aksi Unduh PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStudents.map((item, idx) => {
                    const pct = totalAllDrugs > 0 ? Math.round((item.completedDrugsCount / totalAllDrugs) * 100) : 0
                    return (
                      <tr key={item.profile.id || idx} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 text-center text-muted-foreground">{idx + 1}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900 text-sm">{item.profile.name}</div>
                          <div className="text-[11px] text-muted-foreground">NIM: {item.profile.nim || "-"}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-slate-800">{item.profile.pharmacyName || "-"}</div>
                          <div className="text-[11px] text-muted-foreground">
                            Preceptor: {item.profile.preceptorName || "-"}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-bold text-emerald-700">
                              {item.completedDrugsCount} / {totalAllDrugs}
                            </span>
                            <span className="text-[10px] text-muted-foreground">({pct}%)</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">
                            {item.filledNotesCount} Obat Terisi
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedStudent(item)
                                setModalFilter("filled")
                                setModalDrugSearch("")
                              }}
                              className="h-8 text-xs gap-1 text-slate-700"
                              title="Lihat Pratinjau Catatan"
                            >
                              <Eye className="size-3.5 text-emerald-600" />
                              <span className="hidden sm:inline">Pratinjau</span>
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDownloadSinglePdf(item)}
                              disabled={isGeneratingPdf}
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-xs"
                            >
                              <Download className="size-3.5" />
                              <span>Unduh PDF</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Detail / Pratinjau Mahasiswa */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border bg-white p-6 shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Pratinjau Logbook: {selectedStudent.profile.name}
                  </h3>
                  <Badge variant="outline" className="border-emerald-500 text-emerald-700">
                    NIM: {selectedStudent.profile.nim || "-"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Wahana: <span className="font-semibold text-slate-700">{selectedStudent.profile.pharmacyName || "-"}</span> &bull; 
                  Preceptor: <span className="font-semibold text-slate-700">{selectedStudent.profile.preceptorName || "-"}</span> &bull;
                  Periode: <span className="font-semibold text-slate-700">{selectedStudent.profile.period || "-"}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Filter Modal Tab & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border">
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant={modalFilter === "filled" ? "default" : "outline"}
                  onClick={() => setModalFilter("filled")}
                  className={`text-xs h-8 ${modalFilter === "filled" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "text-slate-700"}`}
                >
                  Obat Terisi / Selesai ({selectedStudent.completedDrugsCount || selectedStudent.filledNotesCount})
                </Button>
                <Button
                  size="sm"
                  variant={modalFilter === "all" ? "default" : "outline"}
                  onClick={() => setModalFilter("all")}
                  className={`text-xs h-8 ${modalFilter === "all" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "text-slate-700"}`}
                >
                  Semua 23 Kelas Terapi
                </Button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nama obat..."
                  value={modalDrugSearch}
                  onChange={(e) => setModalDrugSearch(e.target.value)}
                  className="pl-8 text-xs h-8 bg-white"
                />
              </div>
            </div>

            {/* Modal Body: Daftar Catatan Klinis */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs max-h-[50vh]">
              {(() => {
                const searchQ = modalDrugSearch.toLowerCase().trim()
                const renderedTherapies = THERAPIES.map((t) => {
                  const filteredDrugs = t.drugs.filter((d) => {
                    const entry = selectedStudent.entries[d.id]
                    const n = entry?.notes || {}
                    const hasNotes = Boolean(
                      n.indication ||
                      n.dosage ||
                      n.sideEffects ||
                      n.contraindications ||
                      n.interactions ||
                      n.specialInstructions
                    )
                    const isComplete = Boolean(entry?.markedComplete)

                    if (searchQ && !d.name.toLowerCase().includes(searchQ)) {
                      return false
                    }

                    if (modalFilter === "filled") {
                      return hasNotes || isComplete
                    }
                    return true
                  })

                  return {
                    therapy: t,
                    drugs: filteredDrugs,
                  }
                }).filter((item) => item.drugs.length > 0)

                if (renderedTherapies.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed text-center bg-slate-50/50">
                      <BookOpen className="size-8 text-slate-400 mb-2" />
                      <h4 className="font-semibold text-slate-800 text-sm">Tidak Ada Data Catatan Klinis</h4>
                      <p className="text-xs text-muted-foreground max-w-sm mt-1">
                        {modalDrugSearch
                          ? `Tidak ditemukan obat dengan kata kunci "${modalDrugSearch}".`
                          : "Mahasiswa ini belum mengisi catatan klinis pada obat."}
                      </p>
                    </div>
                  )
                }

                return renderedTherapies.map(({ therapy: t, drugs }) => (
                  <div key={t.id} className="rounded-xl border p-4 space-y-3 bg-slate-50/40">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h4 className="font-bold text-emerald-800 text-xs flex items-center gap-1.5">
                        <Pill className="size-3.5 text-emerald-600" />
                        <span>{t.name}</span>
                      </h4>
                      <Badge variant="outline" className="text-[10px] text-slate-600">
                        {drugs.length} Obat Ditampilkan
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {drugs.map((d) => {
                        const entry = selectedStudent.entries[d.id]
                        const n = entry?.notes || {}
                        const isDone = Boolean(entry?.markedComplete)

                        return (
                          <div key={d.id} className="rounded-lg border bg-white p-3 text-[11px] space-y-2 shadow-2xs">
                            <div className="flex items-center justify-between font-bold text-slate-900 border-b pb-1.5">
                              <span className="text-xs text-emerald-950 font-bold">{d.name}</span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                  isDone
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {isDone ? "✓ Selesai Dipelajari" : "Belum Ditandai"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 leading-relaxed">
                              <div>
                                <span className="font-bold text-slate-900">1. Indikasi Klinis:</span>
                                <p className="text-slate-600 mt-0.5">{n.indication || <span className="text-slate-400 italic">Belum diisi</span>}</p>
                              </div>
                              <div>
                                <span className="font-bold text-slate-900">2. Dosis Lazim:</span>
                                <p className="text-slate-600 mt-0.5">{n.dosage || <span className="text-slate-400 italic">Belum diisi</span>}</p>
                              </div>
                              <div>
                                <span className="font-bold text-slate-900">3. Aturan / Cara Pakai:</span>
                                <p className="text-slate-600 mt-0.5">{n.specialInstructions || <span className="text-slate-400 italic">Belum diisi</span>}</p>
                              </div>
                              <div>
                                <span className="font-bold text-slate-900">4. Efek Samping:</span>
                                <p className="text-slate-600 mt-0.5">{n.sideEffects || <span className="text-slate-400 italic">Belum diisi</span>}</p>
                              </div>
                              <div>
                                <span className="font-bold text-slate-900">5. Kontraindikasi:</span>
                                <p className="text-slate-600 mt-0.5">{n.contraindications || <span className="text-slate-400 italic">Belum diisi</span>}</p>
                              </div>
                              <div>
                                <span className="font-bold text-slate-900">6. Interaksi Obat:</span>
                                <p className="text-slate-600 mt-0.5">{n.interactions || <span className="text-slate-400 italic">Belum diisi</span>}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              })()}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t pt-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedStudent(null)} className="text-xs text-slate-700">
                Tutup
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  handleDownloadSinglePdf(selectedStudent)
                }}
                disabled={isGeneratingPdf}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-sm"
              >
                <Download className="size-3.5" />
                <span>Unduh PDF ({formatStudentFilename(selectedStudent.profile, "pdf")})</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ekspor & Impor Cadangan JSON */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="size-5 text-emerald-600" />
              <CardTitle className="text-base">Cadangan Mentah (JSON)</CardTitle>
            </div>
            <CardDescription>
              Unduh cadangan database mentah format JSON untuk keperluan backup berkala.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportJson} variant="outline" className="w-full text-xs text-slate-700">
              Unduh Backup JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileUp className="size-5 text-blue-600" />
              <CardTitle className="text-base">Pemulihan Cadangan (JSON)</CardTitle>
            </div>
            <CardDescription>
              Tempelkan teks format JSON dari berkas cadangan untuk memulihkan data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              className="h-20 w-full rounded-md border p-2 text-xs font-mono"
              placeholder="Tempelkan isi file JSON di sini..."
              value={backupJson}
              onChange={(e) => setBackupJson(e.target.value)}
            />
            <Button
              onClick={handleImportJson}
              disabled={!backupJson.trim() || isProcessing}
              variant="outline"
              size="sm"
              className="w-full text-xs text-slate-700"
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
            Tindakan di bawah ini akan menghapus semua catatan, riwayat baca, dan progres pembelajaran mahasiswa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!resetConfirm ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setResetConfirm(true)}
              disabled={isProcessing}
              className="text-xs"
            >
              Reset Semua Progres Pembelajaran
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReset}
                disabled={isProcessing}
                className="text-xs"
              >
                {isProcessing ? "Mereset..." : "Ya, Hapus Sekarang"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResetConfirm(false)}
                disabled={isProcessing}
                className="text-xs text-slate-700"
              >
                Batal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <SupabaseConfigModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
