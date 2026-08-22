"use client"

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Heart,
  Layers,
  Pill,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAppStore } from "@/components/app-store-provider"
import { DrugCard } from "@/components/learning/drug-card"
import { LinearProgress } from "@/components/shared/linear-progress"
import { MedicalDisclaimer } from "@/components/shared/medical-disclaimer"
import { PageHeader } from "@/components/shared/page-header"
import { PageSkeleton } from "@/components/shared/page-skeleton"
import { StatCard } from "@/components/shared/stat-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ALL_DRUGS, DRUG_COUNT, THERAPY_COUNT, getDrugById, getTherapyById } from "@/lib/catalog"
import { findContinueTarget, getDrugProgress, getOverallProgress } from "@/lib/progress"
import { EmptyState } from "@/components/shared/empty-state"

export function DashboardView() {
  const { data, hydrated, isAdmin } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    if (hydrated && isAdmin) router.replace("/admin")
  }, [hydrated, isAdmin, router])

  if (!hydrated || isAdmin) return <PageSkeleton />

  const entries = data?.entries || {}
  const overall = getOverallProgress(entries)
  const continueTarget = findContinueTarget(data)
  const displayName = data?.profile?.name?.trim() || "Mahasiswa PKPA"
  const profileIncomplete =
    !(data?.profile?.pharmacyName || data?.profile?.pharmacy)?.trim() ||
    !(data?.profile?.preceptorName || data?.profile?.preceptor)?.trim() ||
    !data?.profile?.period?.trim()

  const recentDrugs = (data?.recent || [])
    .map((item) => {
      const drug = getDrugById(item.drugId)
      if (!drug) return null
      return { drug, viewedAt: item.viewedAt }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  const favoriteDrugs = (data?.favorites || [])
    .map((id) => getDrugById(id))
    .filter((drug): drug is NonNullable<typeof drug> => Boolean(drug))

  const nextUnfinished = ALL_DRUGS.find((drug) => {
    const status = getDrugProgress(entries[drug.id]).status
    return status !== "completed"
  })

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title={`Halo, ${displayName}`}
        description="Catat penguasaan obat PKPA Anda — mekanisme, indikasi, dosis, cara pakai, efek samping, edukasi pasien, dan merk dagang. Progress tersimpan otomatis ke akun NIM Anda."
      />

      {profileIncomplete ? (
        <Alert className="border-sky-200 bg-sky-50">
          <AlertTitle>Lengkapi data PKPA</AlertTitle>
          <AlertDescription>
            Apotek, preseptor, dan periode akan tampil di sampul portofolio PDF.{" "}
            <Link href="/profile" className="font-medium text-sky-800 underline-offset-2 hover:underline">
              Isi profil sekarang
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Layers}
          label="Kelompok terapi"
          value={THERAPY_COUNT}
          hint={`${overall.completedTherapies} kelompok selesai`}
          tone="navy"
        />
        <StatCard
          icon={Pill}
          label="Total obat"
          value={DRUG_COUNT}
          hint={`${overall.completedDrugs} obat selesai`}
          tone="sky"
        />
        <StatCard
          icon={CheckCircle2}
          label="Progress catatan"
          value={`${overall.percent}%`}
          hint={`${overall.filledFields}/${overall.totalFields} field terisi`}
          tone="green"
        />
        <StatCard
          icon={BookOpen}
          label="Sedang dipelajari"
          value={overall.inProgressDrugs}
          hint={`${overall.notStartedDrugs} belum mulai`}
          tone="amber"
        />
      </div>

      <Card className="overflow-hidden border-0 bg-[#0f2c59] text-white shadow-md">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.16em] text-emerald-300 uppercase">
              Lanjutkan belajar
            </p>
            <h2 className="font-heading text-xl font-semibold">{continueTarget.label}</h2>
            <p className="max-w-xl text-sm text-white/75">
              {nextUnfinished
                ? "Kembali ke catatan terakhir atau lanjutkan obat yang belum selesai."
                : "Semua obat sudah ditandai selesai. Tinjau ulang catatan Anda kapan saja."}
            </p>
            <LinearProgress
              value={overall.percent}
              trackClassName="bg-white/15"
              indicatorClassName="bg-emerald-400"
              className="max-w-sm"
            />
          </div>
          <Button
            size="lg"
            className="bg-emerald-500 text-white hover:bg-emerald-400"
            asChild
          >
            <Link href={continueTarget.path}>
              <span>Lanjutkan</span>
              <ArrowRight className="size-4 ml-1.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="size-4 text-sky-700" />
              Terakhir dilihat
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/learning">Semua</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentDrugs.length === 0 ? (
              <EmptyState
                icon={Clock3}
                title="Belum ada riwayat"
                description="Obat yang Anda buka akan muncul di sini (maksimal 5)."
                action={
                  <Button size="sm" asChild>
                    <Link href="/learning">Mulai belajar</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-2">
                {recentDrugs.map(({ drug }) => {
                  const therapy = getTherapyById(drug.therapyId)
                  const progress = getDrugProgress(entries[drug.id])
                  return (
                    <li key={drug.id}>
                      <Link
                        href={`/learning/${drug.therapyId}/${drug.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2.5 hover:bg-muted/60"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{drug.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{therapy?.name}</p>
                        </div>
                        <span className="text-xs font-medium text-emerald-700">
                          {progress.filled}/7
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="size-4 text-rose-500" />
              Favorit
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favoriteDrugs.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="Belum ada favorit"
                description="Tandai obat penting dengan ikon hati di halaman detail."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {favoriteDrugs.slice(0, 4).map((drug) => (
                  <DrugCard
                    key={drug.id}
                    drug={drug}
                    progress={getDrugProgress(entries[drug.id])}
                    favorite
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <MedicalDisclaimer />
    </div>
  )
}
