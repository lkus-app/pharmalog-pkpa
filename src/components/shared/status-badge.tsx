import { Badge } from "@/components/ui/badge"
import { STATUS_LABEL } from "@/lib/constants"
import type { LearningStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const STYLES: Record<LearningStatus, string> = {
  "not-started":
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "in-progress":
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300",
  completed:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
}

export function StatusBadge({
  status,
  className,
}: {
  status: LearningStatus
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn(STYLES[status], className)}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}
