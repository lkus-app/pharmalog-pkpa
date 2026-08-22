"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
  Pill,
  Search,
  Sparkles,
  Zap,
} from "lucide-react"
import { useAppStore } from "@/components/app-store-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { THERAPY_GROUPS, ALL_DRUGS, getTherapyById } from "@/lib/catalog"
import { getDrugProgress, getOverallProgress, getTherapyProgress, findContinueTarget } from "@/lib/progress"

export function LearningView() {
  const { data } = useAppStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTherapyId, setSelectedTherapyId] = useState("all")

  const entries = useMemo(() => data?.entries || {}, [data?.entries])
  const favorites = useMemo(() => data?.favorites || [], [data?.favorites])
  const recent = useMemo(() => data?.recent || [], [data?.recent])

  const overall = useMemo(() => getOverallProgress(entries), [entries])
  const continueTarget = useMemo(() => findContinueTarget(data), [data])

  const favoriteDrugs = useMemo(() => {
    return favorites
      .map((favId) => ALL_DRUGS.find((d) => d.id === favId))
      .filter(Boolean)
  }, [favorites])

  const recentDrugs = useMemo(() => {
    return recent
      .slice(0, 4)
      .map((r) => {
        const drug = ALL_DRUGS.find((d) => d.id === r.drugId)
        return drug ? { ...drug, therapyId: r.therapyId } : null
      })
      .filter(Boolean)
  }, [recent])

  const filteredTherapies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return THERAPY_GROUPS.filter((therapy) => {
      const matchesTherapyFilter =
        selectedTherapyId === "all" || therapy.id === selectedTherapyId

      if (!matchesTherapyFilter) return false

      if (!q) return true

      const matchesTherapyName =
        therapy.name.toLowerCase().includes(q) ||
        (therapy.description && therapy.description.toLowerCase().includes(q))

      const hasMatchingDrug = therapy.drugs.some((drug) => {
        return (
          drug.name.toLowerCase().includes(q) ||
          (drug.genericName && drug.genericName.toLowerCase().includes(q)) ||
          (Array.isArray(drug.brandNames)
            ? drug.brandNames.some((b) => b.toLowerCase().includes(q))
            : String(drug.brandNames || "").toLowerCase().includes(q)) ||
          (Array.isArray(drug.indications)
            ? drug.indications.some((ind) => ind.toLowerCase().includes(q))
            : String(drug.indications || "").toLowerCase().includes(q))
        )
      })

      return matchesTherapyName || hasMatchingDrug
    }).map((therapy) => {
      if (!q) return therapy
      const filteredDrugs = therapy.drugs.filter((drug) => {
        return (
          drug.name.toLowerCase().includes(q) ||
          (drug.genericName && drug.genericName.toLowerCase().includes(q)) ||
          (Array.isArray(drug.brandNames)
            ? drug.brandNames.some((b) => b.toLowerCase().includes(q))
            : String(drug.brandNames || "").toLowerCase().includes(q)) ||
          (Array.isArray(drug.indications)
            ? drug.indications.some((ind) => ind.toLowerCase().includes(q))
            : String(drug.indications || "").toLowerCase().includes(q))
        )
      })
      return {
        ...therapy,
        drugs: filteredDrugs.length > 0 ? filteredDrugs : therapy.drugs,
      }
    })
  }, [searchQuery, selectedTherapyId])

  return (
    <div className="space-y-8 pb-12">
      {/* Header Halaman */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <Sparkles className="size-3.5" />
            Materi Pembelajaran PKPA
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Katalog Kelas Terapi & Obat
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pelajari 23 kelas terapi, lengkapi 7 parameter klinis, dan pantau kemajuan belajar Anda.
          </p>
        </div>

        {/* Ringkasan Kemajuan Cepat */}
        <div className="flex items-center gap-4 rounded-xl border bg-white p-3.5 shadow-sm">
          <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Zap className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">{overall.percent}% Selesai</span>
              <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700">
                {overall.completedDrugs} / {overall.drugCount} Obat
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {overall.completedTherapies} dari {overall.therapyCount} kelas terapi tuntas
            </p>
          </div>
        </div>
      </div>

      {/* Kartu Rekomendasi Lanjut Belajar */}
      {continueTarget && (
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Lanjutkan Terakhir Dilihat
              </span>
              <h3 className="text-lg font-bold text-slate-900">{continueTarget.label}</h3>
              <p className="text-xs text-slate-600">
                Klik tombol di samping untuk langsung melanjutkan pencatatan klinis obat ini.
              </p>
            </div>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
              <Link href={continueTarget.path}>
                <span>Lanjutkan Sekarang</span>
                <ChevronRight className="size-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Riwayat Terakhir & Favorit */}
      {(recentDrugs.length > 0 || favoriteDrugs.length > 0) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {recentDrugs.length > 0 && (
            <div className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Clock className="size-4 text-emerald-600" />
                <span>Terakhir Dipelajari</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {recentDrugs.map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/learning/${item.therapyId || "analgetika-non-narkotika"}/${item.id}`}
                    className="group flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 transition hover:border-emerald-500 hover:bg-white"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Pill className="size-4 text-emerald-600 shrink-0" />
                      <span className="truncate text-xs font-semibold text-slate-800 group-hover:text-emerald-600">
                        {item.name}
                      </span>
                    </div>
                    <ChevronRight className="size-3.5 text-slate-400 group-hover:text-emerald-600" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {favoriteDrugs.length > 0 && (
            <div className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Bookmark className="size-4 text-amber-500" />
                <span>Obat Favorit & Ditandai</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {favoriteDrugs.slice(0, 4).map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/learning/${item.therapyId || "analgetika-non-narkotika"}/${item.id}`}
                    className="group flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 transition hover:border-emerald-500 hover:bg-white"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Bookmark className="size-3.5 fill-amber-400 text-amber-400 shrink-0" />
                      <span className="truncate text-xs font-semibold text-slate-800 group-hover:text-emerald-600">
                        {item.name}
                      </span>
                    </div>
                    <ChevronRight className="size-3.5 text-slate-400 group-hover:text-emerald-600" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter & Pencarian */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari obat, nama generik, merk, atau indikasi..."
              className="pl-9 text-sm"
            />
          </div>

          {/* Filter Tab Kategori */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <Button
              size="sm"
              variant={selectedTherapyId === "all" ? "default" : "outline"}
              onClick={() => setSelectedTherapyId("all")}
              className={selectedTherapyId === "all" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
            >
              Semua ({THERAPY_GROUPS.length})
            </Button>
            {THERAPY_GROUPS.map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant={selectedTherapyId === t.id ? "default" : "outline"}
                onClick={() => setSelectedTherapyId(t.id)}
                className={selectedTherapyId === t.id ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
              >
                {t.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Daftar Kelas Terapi & Kartu Obat */}
      <div className="space-y-8">
        {filteredTherapies.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center bg-white">
            <BookOpen className="mx-auto size-8 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold text-slate-800">Obat Tidak Ditemukan</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Tidak ada obat atau terapi yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setSelectedTherapyId("all")
              }}
              className="mt-4"
            >
              Reset Pencarian
            </Button>
          </div>
        ) : (
          filteredTherapies.map((therapy) => {
            const stats = getTherapyProgress(therapy.id, entries)
            const drugs = therapy.drugs || []

            return (
              <div key={therapy.id} className="space-y-4 rounded-2xl border bg-slate-50/60 p-5 sm:p-6 shadow-sm">
                {/* Header Terapi */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-xs">
                      <Layers className="size-5" />
                    </div>
                    <div>
                      <Link
                        href={`/learning/${therapy.id}`}
                        className="group flex items-center gap-1.5 text-lg font-bold text-slate-900 hover:text-emerald-600"
                      >
                        {therapy.name}
                        <ChevronRight className="size-4 text-slate-400 group-hover:translate-x-0.5" />
                      </Link>
                      <p className="text-xs text-muted-foreground">{therapy.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-600">
                      {stats.completedDrugs} / {stats.drugCount} Selesai ({stats.percent}%)
                    </span>
                    <div className="h-2.5 w-24 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${stats.percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Grid Obat dalam Terapi */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {drugs.map((drug) => {
                    const entry = entries[drug.id]
                    const progress = getDrugProgress(entry)
                    const isDone = progress.status === "completed"
                    const isFav = favorites.includes(drug.id)
                    const brandText = Array.isArray(drug.brandNames)
                      ? drug.brandNames.join(", ")
                      : String(drug.brandNames || "")

                    return (
                      <Link
                        key={drug.id}
                        href={`/learning/${therapy.id}/${drug.id}`}
                        className="group flex flex-col justify-between rounded-xl border bg-white p-4 shadow-xs transition-all hover:border-emerald-500 hover:shadow-md"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                              <Pill className="size-4" />
                            </div>
                            <div className="flex items-center gap-1.5">
                              {isFav && <Bookmark className="size-4 fill-amber-400 text-amber-400" />}
                              {isDone && <CheckCircle2 className="size-4 text-emerald-600" />}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                              {drug.name}
                            </h4>
                            {brandText && (
                              <p className="line-clamp-1 text-[11px] font-medium text-slate-500">
                                {brandText}
                              </p>
                            )}
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {Array.isArray(drug.indications)
                                ? drug.indications.join("; ")
                                : drug.description || "Klik untuk melengkapi catatan klinis dan edukasi pasien..."}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground">
                          <span className={isDone ? "font-semibold text-emerald-600" : ""}>
                            {isDone ? "Selesai (100%)" : `${progress.filled}/7 Field`}
                          </span>
                          <span className="font-semibold text-emerald-600 group-hover:underline">
                            Buka Catatan &rarr;
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
