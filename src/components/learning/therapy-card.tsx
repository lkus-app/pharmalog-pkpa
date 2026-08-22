import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { LinearProgress } from "@/components/shared/linear-progress"
import { StatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { THERAPY_ICONS } from "@/lib/icons"
import type { LearningStatus, TherapyGroup } from "@/lib/types"

export function TherapyCard({
  group,
  percent,
  status,
  completedDrugs,
}: {
  group: TherapyGroup
  percent: number
  status: LearningStatus
  completedDrugs: number
}) {
  const Icon = THERAPY_ICONS[group.icon]

  return (
    <Link href={`/learning/${group.id}`} className="block h-full">
      <Card className="h-full shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-sky-50 text-sky-800">
              <Icon className="size-5" />
            </span>
            <StatusBadge status={status} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-base font-semibold leading-snug">{group.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{group.description}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {completedDrugs}/{group.drugs.length} obat selesai
              </span>
              <span className="font-medium text-foreground">{percent}%</span>
            </div>
            <LinearProgress value={percent} />
            <span className="inline-flex items-center text-xs font-medium text-sky-800">
              Buka kelompok
              <ChevronRight className="size-3.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
