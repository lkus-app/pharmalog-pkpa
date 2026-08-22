"use client"

import { useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAppStore } from "@/components/app-store-provider"
import { DrugForm } from "@/components/drug/drug-form"
import { ALL_DRUGS, THERAPY_GROUPS, getDrugById, getTherapyById } from "@/lib/catalog"
import { ArrowLeft, ChevronRight, Pill, AlertCircle, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DrugDetailPage() {
  const router = useRouter()
  const rawParams = useParams()
  const rawTherapyId = Array.isArray(rawParams?.therapyId)
    ? rawParams.therapyId[0]
    : rawParams?.therapyId || ""
  const rawDrugId = Array.isArray(rawParams?.drugId)
    ? rawParams.drugId[0]
    : rawParams?.drugId || ""

  const therapyId = decodeURIComponent(String(rawTherapyId)).trim()
  const drugId = decodeURIComponent(String(rawDrugId)).trim()

  const { recordRecent, isFavorite, toggleFavorite, hydrated } = useAppStore()

  const { therapy, drug } = useMemo(() => {
    if (!therapyId && !drugId) return { therapy: null, drug: null }
    const cleanTId = therapyId.toLowerCase()
    const cleanDId = drugId.toLowerCase()

    let foundTherapy =
      getTherapyById(cleanTId) ||
      THERAPY_GROUPS.find(
        (t) => t.id.toLowerCase() === cleanTId || t.name.toLowerCase() === cleanTId
      ) ||
      null

    let foundDrug =
      foundTherapy?.drugs?.find(
        (d) => d.id.toLowerCase() === cleanDId || d.name.toLowerCase() === cleanDId
      ) ||
      getDrugById(cleanDId) ||
      ALL_DRUGS.find(
        (d) => d.id.toLowerCase() === cleanDId || d.name.toLowerCase() === cleanDId
      ) ||
      null

    if (foundDrug && !foundTherapy) {
      foundTherapy =
        THERAPY_GROUPS.find((t) =>
          t.drugs.some((d) => d.id.toLowerCase() === foundDrug?.id.toLowerCase())
        ) || null
    }

    return { therapy: foundTherapy, drug: foundDrug }
  }, [therapyId, drugId])

  useEffect(() => {
    if (drug?.id) {
      recordRecent(drug.id, therapy?.id || therapyId)
    }
  }, [drug?.id, therapy?.id, therapyId, recordRecent])

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="size-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Memuat data obat...</p>
        </div>
      </div>
    )
  }

  if (!drug) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center space-y-4">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <AlertCircle className="size-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Obat Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground">
          Data obat &quot;{drugId}&quot; tidak terdaftar dalam basis data PKPA.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="size-4" /> Kembali
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/learning">Kembali ke Pembelajaran</Link>
          </Button>
        </div>
      </div>
    )
  }

  const brandNamesList = Array.isArray(drug.brandNames)
    ? drug.brandNames
    : typeof drug.brandNames === "string" && drug.brandNames
    ? [drug.brandNames]
    : []

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/learning" className="hover:text-foreground">
          Materi Pembelajaran
        </Link>
        <ChevronRight className="size-3.5" />
        {therapy ? (
          <>
            <Link href={`/learning/${therapy.id}`} className="hover:text-foreground">
              {therapy.name}
            </Link>
            <ChevronRight className="size-3.5" />
          </>
        ) : null}
        <span className="font-medium text-foreground">{drug.name}</span>
      </nav>

      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Pill className="size-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{drug.name}</h1>
              {brandNamesList.length > 0 ? (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-muted-foreground">
                  {brandNamesList.join(", ")}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {drug.drugClass || therapy?.name || "Materi Farmakoterapi"} &bull; Golongan: {drug.category || "Obat Keras"}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleFavorite(drug.id)}
          className="self-start sm:self-center gap-1.5"
        >
          <Bookmark className={`size-4 ${isFavorite(drug.id) ? "fill-amber-400 text-amber-400" : ""}`} />
          <span>{isFavorite(drug.id) ? "Tersimpan di Favorit" : "Simpan ke Favorit"}</span>
        </Button>
      </div>

      <DrugForm drug={drug} therapyId={therapy?.id || therapyId} />
    </div>
  )
}
