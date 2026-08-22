"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useAppStore } from "@/components/app-store-provider"
import { THERAPIES, getAllDrugs } from "@/lib/therapies"
import { getFilledNotesCount, hasNotesContent, calculateOverallProgress } from "@/lib/mappers"
import { downloadJson } from "@/lib/storage"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function PortfolioView() {
  const { data, hydrated } = useAppStore()
  const [activeFilter, setActiveFilter] = useState<"all" | "completed" | "has_notes">("all")

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

  const handleExportBackup = () => {
    if (data) {
      downloadJson(data, `PharmaLog-PKPA-${profile.nim || "Portofolio"}.json`)
    }
  }

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print()
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
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer className="size-4 text-slate-600" />
              <span>Cetak / PDF</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleExportBackup}
              className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 text-white"
            >
              <Download className="size-4" />
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
            className={activeFilter === "all" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            Semua ({portfolioItems.length})
          </Button>
          <Button
            size="sm"
            variant={activeFilter === "completed" ? "default" : "outline"}
            onClick={() => setActiveFilter("completed")}
            className={activeFilter === "completed" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            Selesai ({overall.completed})
          </Button>
          <Button
            size="sm"
            variant={activeFilter === "has_notes" ? "default" : "outline"}
            onClick={() => setActiveFilter("has_notes")}
            className={activeFilter === "has_notes" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            Ada Catatan ({totalNotesFilled})
          </Button>
        </div>
      </div>

      {/* Daftar Tabel Rekap Logbook */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <Pill className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Belum ada data obat yang sesuai dengan filter ini.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="divide-y">
              {filteredItems.map(({ drug, therapy, notes, isCompleted, hasContent }) => (
                <div key={drug.id} className="p-5 transition hover:bg-slate-50/70">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">{drug.name}</span>
                        {drug.genericName && (
                          <span className="text-xs text-muted-foreground">({drug.genericName})</span>
                        )}
                        {isCompleted ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-none">
                            Selesai
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-500">
                            Dalam Progres
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {therapy?.name || "Materi Farmakoterapi"} &bull; Golongan: {drug.drugClass || drug.category}
                      </p>
                    </div>

                    <Button asChild size="sm" variant="ghost" className="self-start text-xs text-emerald-600 gap-1 print:hidden">
                      <Link href={`/learning/${therapy?.id || "kardiovaskular"}/${drug.id}`}>
                        Buka Detail <ExternalLink className="size-3" />
                      </Link>
                    </Button>
                  </div>

                  {/* Isi Catatan Klinis Mahasiswa */}
                  {hasContent ? (
                    <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-3.5 text-xs sm:grid-cols-2 lg:grid-cols-3">
                      {notes.indication && (
                        <div>
                          <span className="font-semibold text-slate-600">Indikasi Klinis:</span>
                          <p className="text-slate-800 mt-0.5">{notes.indication}</p>
                        </div>
                      )}
                      {notes.dosage && (
                        <div>
                          <span className="font-semibold text-slate-600">Dosis &amp; Aturan Pakai:</span>
                          <p className="text-slate-800 mt-0.5">{notes.dosage}</p>
                        </div>
                      )}
                      {notes.sideEffects && (
                        <div>
                          <span className="font-semibold text-slate-600">Efek Samping:</span>
                          <p className="text-slate-800 mt-0.5">{notes.sideEffects}</p>
                        </div>
                      )}
                      {notes.contraindications && (
                        <div>
                          <span className="font-semibold text-slate-600">Kontraindikasi:</span>
                          <p className="text-slate-800 mt-0.5">{notes.contraindications}</p>
                        </div>
                      )}
                      {notes.interactions && (
                        <div>
                          <span className="font-semibold text-slate-600">Interaksi Obat:</span>
                          <p className="text-slate-800 mt-0.5">{notes.interactions}</p>
                        </div>
                      )}
                      {notes.specialInstructions && (
                        <div>
                          <span className="font-semibold text-slate-600">Instruksi &amp; Konseling:</span>
                          <p className="text-slate-800 mt-0.5">{notes.specialInstructions}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs italic text-slate-400">
                      Belum ada catatan logbook yang diisi untuk obat ini.
                    </p>
                  )}

                  {/* Tag Obat */}
                  {Array.isArray(notes.tags) && notes.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {notes.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
