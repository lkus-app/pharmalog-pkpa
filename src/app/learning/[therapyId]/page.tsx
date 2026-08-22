"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAppStore } from "@/components/app-store-provider"
import { getTherapyById, THERAPY_GROUPS } from "@/lib/catalog"
import { getDrugProgress } from "@/lib/progress"
import { ArrowLeft, ChevronRight, Pill, CheckCircle2, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TherapyDetailPage() {
  const router = useRouter()
  const rawParams = useParams()
  const rawTherapyId = Array.isArray(rawParams?.therapyId)
    ? rawParams.therapyId[0]
    : rawParams?.therapyId || ""
  const therapyId = decodeURIComponent(String(rawTherapyId)).trim()
  const cleanId = therapyId.toLowerCase()

  const { data } = useAppStore()

  const therapy =
    getTherapyById(cleanId) ||
    THERAPY_GROUPS.find(
      (t) => t.id.toLowerCase() === cleanId || t.name.toLowerCase() === cleanId
    )

  if (!therapy) {
    return (
      <div className="mx-auto max-w-3xl p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Kelas Terapi Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground">Kelas terapi &quot;{therapyId}&quot; tidak terdaftar.</p>
        <Button onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="size-4" /> Kembali
        </Button>
      </div>
    )
  }

  const completedCount = (therapy.drugs || []).filter((d) => {
    const entry = data?.entries?.[d.id]
    return getDrugProgress(entry).status === "completed"
  }).length

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/learning" className="hover:text-foreground">
          Materi Pembelajaran
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">{therapy.name}</span>
      </nav>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{therapy.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{therapy.description || "Daftar obat dalam kelas terapi ini."}</p>
          </div>
          <div className="text-right text-xs">
            <span className="font-semibold text-emerald-600">
              Progres: {completedCount} / {therapy.drugs?.length || 0} Selesai
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(therapy.drugs || []).map((drug) => {
          const entry = data?.entries?.[drug.id]
          const progress = getDrugProgress(entry)
          const isDone = progress.status === "completed"
          const isFav = (data?.favorites || []).includes(drug.id)
          const indicationsText = Array.isArray(drug.indications)
            ? drug.indications.join(", ")
            : typeof drug.indications === "string"
            ? drug.indications
            : drug.description || "Klik untuk mengisi logbook obat..."

          return (
            <Link
              key={drug.id}
              href={`/learning/${therapy.id}/${drug.id}`}
              className="group flex flex-col justify-between rounded-xl border bg-white p-4 shadow-sm transition hover:border-emerald-500 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Pill className="size-4" />
                  </div>
                  <div className="flex items-center gap-1">
                    {isFav ? <Bookmark className="size-4 fill-amber-400 text-amber-400" /> : null}
                    {isDone ? <CheckCircle2 className="size-4 text-emerald-600" /> : null}
                  </div>
                </div>
                <h3 className="mt-3 font-bold text-slate-900 group-hover:text-emerald-600">
                  {drug.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {indicationsText}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <span>{isDone ? "Selesai Dipelajari" : `${progress.filled}/7 Field`}</span>
                <span className="font-medium text-emerald-600 group-hover:underline">Buka Detail &rarr;</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
