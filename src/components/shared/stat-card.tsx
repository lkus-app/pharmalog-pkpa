import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "navy",
}: {
  icon: LucideIcon
  label: string
  value: string | number
  hint?: string
  tone?: "navy" | "green" | "sky" | "amber"
}) {
  const tones = {
    navy: "bg-[#0f2c59]/10 text-[#0f2c59]",
    green: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-start gap-3">
        <span className={cn("flex size-10 items-center justify-center rounded-lg", tones[tone])}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="font-heading text-2xl font-semibold tracking-tight">{value}</p>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  )
}
