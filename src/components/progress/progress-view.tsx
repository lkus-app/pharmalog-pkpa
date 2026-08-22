"use client"

import Link from "next/link"
import { useAppStore } from "@/components/app-store-provider"
import { LinearProgress } from "@/components/shared/linear-progress"
import { PageHeader } from "@/components/shared/page-header"
import { PageSkeleton } from "@/components/shared/page-skeleton"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatCard } from "@/components/shared/stat-card"
import { Card, CardContent } from "@/components/ui/card"
import { THERAPY_GROUPS } from "@/lib/catalog"
import { THERAPY_ICONS } from "@/lib/icons"
import { getOverallProgress, getTherapyProgress } from "@/lib/progress"
import { BookOpen, CheckCircle2, CircleDashed, Loader } from "lucide-react"

export function ProgressView() {
  const { data, hydrated } = useAppStore()

  if (!hydrated) return <PageSkeleton />

  const overall = getOverallProgress(data.entries)
  const groups = THERAPY_GROUPS.map((group) => ({
    group,
    progress: getTherapyProgress(group.id, data.entries),
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Progress"
        title="Ringkasan penguasaan obat"
        description="Progress dihitung dari jumlah field terisi dibagi 7 per obat, lalu diagregasi per kelompok dan keseluruhan."
      />

      <Card className="shadow-sm">
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Progress keseluruhan</p>
              <p className="font-heading text-4xl font-semibold tracking-tight">{overall.percent}%</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {overall.filledFields} dari {overall.totalFields} field terisi
            </p>
          </div>
          <LinearProgress value={overall.percent} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CheckCircle2} label="Selesai" value={overall.completedDrugs} tone="green" />
        <StatCard icon={Loader} label="Sedang" value={overall.inProgressDrugs} tone="sky" />
        <StatCard icon={CircleDashed} label="Belum mulai" value={overall.notStartedDrugs} tone="amber" />
        <StatCard
          icon={BookOpen}
          label="Kelompok selesai"
          value={`${overall.completedTherapies}/${overall.therapyCount}`}
          tone="navy"
        />
      </div>

      <div className="space-y-3">
        {groups.map(({ group, progress }) => {
          const Icon = THERAPY_ICONS[group.icon]
          return (
            <Link key={group.id} href={`/learning/${group.id}`} className="block">
              <Card className="shadow-sm transition-colors hover:bg-muted/30">
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-800">
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading font-semibold">{group.name}</h3>
                        <StatusBadge status={progress.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {progress.completedDrugs}/{progress.drugCount} obat selesai · {progress.filledFields}/
                        {progress.totalFields} field
                      </p>
                    </div>
                  </div>
                  <div className="w-full space-y-1 sm:max-w-xs">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress.percent}%</span>
                    </div>
                    <LinearProgress value={progress.percent} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
