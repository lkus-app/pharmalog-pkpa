import { Check, CloudOff, LoaderCircle } from "lucide-react"
import type { SaveStatus } from "@/components/app-store-provider"
import { cn } from "@/lib/utils"

export function SaveIndicator({
  status,
  className,
}: {
  status: SaveStatus
  className?: string
}) {
  if (status === "idle") return null

  const content =
    status === "saving" ? (
      <>
        <LoaderCircle className="size-3.5 animate-spin" />
        Menyimpan...
      </>
    ) : status === "error" ? (
      <>
        <CloudOff className="size-3.5" />
        Gagal menyimpan
      </>
    ) : (
      <>
        <Check className="size-3.5" />
        Tersimpan
      </>
    )

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        status === "saved" && "text-emerald-600",
        status === "saving" && "text-sky-700",
        status === "error" && "text-destructive",
        className
      )}
    >
      {content}
    </span>
  )
}
