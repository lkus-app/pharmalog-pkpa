"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useAppStore } from "@/components/app-store-provider"
import { THERAPIES, getAllDrugs } from "@/lib/therapies"
import { getFilledNotesCount, hasNotesContent, calculateOverallProgress } from "@/lib/mappers"
import { downloadJson } from "@/lib/storage"
import { generateStudentPdf, formatStudentFilename } from "@/lib/pdf-report"
import {
  User,
  GraduationCap,
  Building,
  Calendar,
  Award,
  CheckCircle2,
  FileText,
  Download,
  Printer,
  BookOpen,
  Pill,
  ExternalLink,
  Sparkles,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function PortfolioView() {
  const { data, hydrated } = useAppStore()
  const [activeFilter, setActiveFilter] = useState<"all" | "completed" | "has_notes">("all")
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const profile = data?.profile || {
    id: "",
    name: "Mahasiswa PKPA",
    nim: "-",
    pharmacyName: "-",
    preceptorName: "-",
    period: "-",
    role: "student",
  }

  const entries = data?.entries || {}
  const allDrugs = useMemo(() => getAllDrugs(), [])

  // Statistik keseluruhan
  const overall = useMemo(() => {
    return calculateOverallProgress(THERAPIES || [], entries)
  }, [entries])

  // Data gabungan obat dan catatan logbook
  const portfolioItems = useMemo(() => {
    return allDrugs.map((drug) => {
      const entry = entries[drug.id]
      const notes = entry?.notes || {
        indication: "",
        dosage: "",
        sideEffects: "",
        contraindications: "",
        interactions: "",
        specialInstructions: "",
        tags: [],
      }

      const isCompleted = Boolean(entry?.markedComplete)
      const filledCount = getFilledNotesCount(notes)
      const hasContent = hasNotesContent(notes)

      // Cari kelas terapi
      const therapy = (THERAPIES || []).find((t) =>
        (t.drugs || []).some((d) => d.id === drug.id)
      )

      return {
        drug,
        therapy,
        notes,
        isCompleted,
        filledCount,
        hasContent,
        updatedAt: entry?.updatedAt,
      }
    })
  }, [allDrugs, entries])

  // Filter tampilan
  const filteredItems = useMemo(() => {
    if (activeFilter === "completed") {
      return portfolioItems.filter((item) => item.isCompleted)
    }
    if (activeFilter === "has_notes") {
      return portfolioItems.filter((item) => item.hasContent)
    }
    return portfolioItems
  }, [portfolioItems, activeFilter])

  const totalNotesFilled = useMemo(() => {
    return portfolioItems.filter((i) => i.hasContent).length
  }, [portfolioItems])

  // Ekspor JSON dengan nama berkas Nama_NIM.json
  const handleExportBackup = () => {
    if (data) {
      const defaultFilename = formatStudentFilename(profile, "json")
      downloadJson(data, defaultFilename)
    }
  }

  // Unduh PDF Resmi dengan nama berkas Nama_NIM.pdf
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true)
    try {
      const defaultFilename = formatStudentFilename(profile, "pdf")
      await generateStudentPdf(
        {
          profile,
          entries,
          completedDrugsCount: overall.completed,
          filledNotesCount: totalNotesFilled,
        },
        defaultFilename
      )
    } catch (err) {
      console.error("Gagal cetak PDF:", err)
      alert("Gagal mengunduh dokumen PDF. Silakan coba kembali atau gunakan tombol Cetak.")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Dialog Cetak Browser dengan default file title Nama_NIM
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      const originalTitle = document.title
      const defaultFilename = formatStudentFilename(profile, "pdf").replace(/\.pdf$/i, "")
      document.title = defaultFilename
      window.print()
      setTimeout(() => {
        document.title = originalTitle
      }, 1500)
    }
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="size-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Memuat data portofolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8 print:p-0">
      {/* Header Profil Mahasiswa (Tampil di Layar & Cetak) */}
      <div className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8 print:border-none print:shadow-none print:p-2">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b pb-6">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md print:hidden">
              <GraduationCap className="size-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  {profile.name || "Nama Mahasiswa"}
                </h1>
                <Badge variant="outline" className="border-emerald-500 text-emerald-700">
                  NIM: {profile.nim || "-"}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Portofolio &amp; Lembar Kerja Praktik Kerja Profesi Apoteker (PKPA)
              </p>
            </div>
          </div>

          {/* Tombol Cetak & Ekspor (Disembunyikan saat dicetak) */}
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button
              variant="default"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 text-white shadow-xs"
            >
              {isGeneratingPdf ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              <span>{isGeneratingPdf ? "Menyiapkan PDF..." : "Unduh PDF"}</span>
            </Button>

            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-slate-700">
              <Printer className="size-4 text-slate-600" />
              <span>Cetak</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportBackup}
              className="gap-1.5 text-slate-700"
            >
              <Download className="size-4 text-slate-600" />
              <span>Ekspor JSON</span>
            </Button>
          </div>
        </div>

        {/* Info Lokasi PKPA & Preseptor */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3">
            <Building className="size-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[11px] text-muted-foreground block">Wahana / Apotek:</span>
              <span className="font-semibold text-slate-800">{profile.pharmacyName || "-"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3">
            <User className="size-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[11px] text-muted-foreground block">Preseptor / Pembimbing:</span>
              <span className="font-semibold text-slate-800">{profile.preceptorName || "-"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3">
            <Calendar className="size-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[11px] text-muted-foreground block">Periode PKPA:</span>
              <span className="font-semibold text-slate-800">{profile.period || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Kartu Metrik Ringkasan (Print Friendly) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Obat Selesai</span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{overall.completed}</span>
            <span className="text-xs text-muted-foreground">dari {overall.total} obat</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Catatan Terisi</span>
            <FileText className="size-4 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalNotesFilled}</span>
            <span className="text-xs text-muted-foreground">obat tercatat</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Tingkat Capaian</span>
            <Award className="size-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{overall.percentage}%</span>
            <span className="text-xs text-muted-foreground">selesai total</span>
          </div>
        </div>
      </div>

      {/* Filter Tab Logbook (Disembunyikan saat dicetak) */}
      <div className="flex items-center justify-between border-b pb-3 print:hidden">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">Rekapitulasi Logbook Obat</h2>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={activeFilter === "all" ? "default" : "outline"}
            onClick={() => setActiveFilter("all")}
            className={activeFilter === "all" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
          >
            Semua ({portfolioItems.length})
          </Button>
          <Button
            size="sm"
            variant={activeFilter === "completed" ? "default" : "outline"}
            onClick={() => setActiveFilter("completed")}
            className={activeFilter === "completed" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
          >
            Selesai ({overall.completed})
          </Button>
          <Button
            size="sm"
            variant={activeFilter === "has_notes" ? "default" : "outline"}
            onClick={() => setActiveFilter("has_notes")}
            className={activeFilter === "has_notes" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
          >
            Ada Catatan ({totalNotesFilled})
          </Button>
        </div>
      </div>

      {/* Daftar Item Portofolio */}
      {filteredItems.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed bg-white p-8 text-center">
          <Pill className="size-10 text-muted-foreground/50 mb-2" />
          <h3 className="text-base font-semibold text-slate-900">Belum Ada Catatan Sesuai Filter</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            Buka menu Lembar Kerja Obat untuk mulai menulis catatan klinis atau menandai obat yang telah dipelajari.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.drug.id}
              className="rounded-2xl border bg-white p-5 shadow-xs transition hover:border-emerald-200"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Pill className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.drug.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.therapy?.name || "Kelas Terapi"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.isCompleted && (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      ✓ Selesai
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs text-slate-600">
                    {item.filledCount}/6 Parameter Klinis
                  </Badge>
                  <Link
                    href={`/therapies/${item.therapy?.id}/drugs/${item.drug.id}`}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 ml-2 print:hidden"
                  >
                    <span>Edit</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>

              {/* Grid 6 Parameter Klinis Obat */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                <div className="rounded-xl bg-slate-50/75 p-3">
                  <span className="font-semibold text-slate-700 block mb-1">1. Indikasi Klinis</span>
                  <p className="text-slate-600 leading-relaxed">
                    {item.notes.indication || <span className="text-muted-foreground italic">Belum diisi</span>}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50/75 p-3">
                  <span className="font-semibold text-slate-700 block mb-1">2. Dosis Lazim</span>
                  <p className="text-slate-600 leading-relaxed">
                    {item.notes.dosage || <span className="text-muted-foreground italic">Belum diisi</span>}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50/75 p-3">
                  <span className="font-semibold text-slate-700 block mb-1">3. Aturan / Cara Pakai</span>
                  <p className="text-slate-600 leading-relaxed">
                    {item.notes.specialInstructions || <span className="text-muted-foreground italic">Belum diisi</span>}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50/75 p-3">
                  <span className="font-semibold text-slate-700 block mb-1">4. Efek Samping</span>
                  <p className="text-slate-600 leading-relaxed">
                    {item.notes.sideEffects || <span className="text-muted-foreground italic">Belum diisi</span>}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50/75 p-3">
                  <span className="font-semibold text-slate-700 block mb-1">5. Kontraindikasi</span>
                  <p className="text-slate-600 leading-relaxed">
                    {item.notes.contraindications || <span className="text-muted-foreground italic">Belum diisi</span>}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50/75 p-3">
                  <span className="font-semibold text-slate-700 block mb-1">6. Interaksi Obat</span>
                  <p className="text-slate-600 leading-relaxed">
                    {item.notes.interactions || <span className="text-muted-foreground italic">Belum diisi</span>}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lembar Pengesahan Tanda Tangan */}
      <div className="mt-12 rounded-2xl border bg-white p-8 print:border-none print:shadow-none">
        <h3 className="text-center font-bold text-slate-900 text-sm uppercase tracking-wide mb-8">
          Lembar Pengesahan Logbook PKPA
        </h3>

        <div className="grid grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-16">
            <p className="text-muted-foreground">Mahasiswa Praktikan,</p>
            <div>
              <p className="font-bold text-slate-900 underline underline-offset-4">
                {profile.name || "( ................................................ )"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">NIM: {profile.nim || "-"}</p>
            </div>
          </div>

          <div className="space-y-16">
            <p className="text-muted-foreground">Apoteker Pembimbing / Preceptor,</p>
            <div>
              <p className="font-bold text-slate-900 underline underline-offset-4">
                {profile.preceptorName || "( ................................................ )"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">SIPAP / STRA: .......................................</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
