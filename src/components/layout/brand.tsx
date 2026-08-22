import { Pill } from "lucide-react"
import Link from "next/link"
import { APP_NAME, APP_SUBTITLE } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function Brand({
  inverted = false,
  compact = false,
}: {
  inverted?: boolean
  compact?: boolean
}) {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-2.5">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm",
          compact && "size-8"
        )}
      >
        <Pill className={compact ? "size-4" : "size-5"} />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block truncate font-heading text-sm font-semibold tracking-tight",
            inverted ? "text-white" : "text-foreground"
          )}
        >
          {APP_NAME}
        </span>
        {!compact ? (
          <span
            className={cn(
              "block truncate text-[11px] leading-tight",
              inverted ? "text-white/70" : "text-muted-foreground"
            )}
          >
            {APP_SUBTITLE}
          </span>
        ) : null}
      </span>
    </Link>
  )
}
