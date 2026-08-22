import { cn } from "@/lib/utils"

interface LinearProgressProps {
  value: number
  className?: string
  trackClassName?: string
  indicatorClassName?: string
}

export function LinearProgress({
  value,
  className,
  trackClassName,
  indicatorClassName,
}: LinearProgressProps) {
  const percent = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", trackClassName, className)}
    >
      <div
        className={cn(
          "h-full rounded-full bg-emerald-500 transition-[width] duration-500 ease-out",
          indicatorClassName
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
