import { ShieldAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MEDICAL_DISCLAIMER } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function MedicalDisclaimer({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  if (compact) {
    return (
      <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
        {MEDICAL_DISCLAIMER}
      </p>
    )
  }

  return (
    <Alert className={cn("border-amber-200 bg-amber-50/80", className)}>
      <ShieldAlert className="text-amber-700" />
      <AlertTitle className="text-amber-950">Disclaimer medis</AlertTitle>
      <AlertDescription className="text-amber-900/80">{MEDICAL_DISCLAIMER}</AlertDescription>
    </Alert>
  )
}
