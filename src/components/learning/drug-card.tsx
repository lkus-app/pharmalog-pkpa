import React from "react"
import { Heart } from "lucide-react"
import Link from "next/link"
import { LinearProgress } from "@/components/shared/linear-progress"
import { StatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Drug, DrugProgress } from "@/lib/types"
import { cn } from "@/lib/utils"

export function DrugCard({
  drug,
  progress,
  favorite,
}: {
  drug: Drug
  progress: DrugProgress
  favorite: boolean
  key?: React.Key
}) {
  return (
    <Link href={`/learning/${drug.therapyId}/${drug.id}`} className="block h-full">
      <Card className="h-full shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-base font-semibold leading-snug">{drug.name}</h3>
            <Heart
              className={cn(
                "size-4 shrink-0",
                favorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
              )}
            />
          </div>
          <StatusBadge status={progress.status} />
          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {progress.filled}/{progress.total} field
              </span>
              <span className="font-medium text-foreground">{progress.percent}%</span>
            </div>
            <LinearProgress value={progress.percent} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
