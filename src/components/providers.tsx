"use client"

import type { ReactNode } from "react"
import { AppStoreProvider } from "@/components/app-store-provider"
import { AuthGate } from "@/components/auth/auth-gate"
import { AppShell } from "@/components/layout/app-shell"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <AppStoreProvider>
        <AuthGate>
          <AppShell>{children}</AppShell>
        </AuthGate>
        <Toaster position="top-right" theme="light" richColors />
      </AppStoreProvider>
    </TooltipProvider>
  )
}
