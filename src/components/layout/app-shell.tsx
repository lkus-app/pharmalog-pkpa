import type { ReactNode } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { MedicalDisclaimer } from "@/components/shared/medical-disclaimer"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full bg-[oklch(0.975_0.01_250)]">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-5 sm:px-6 sm:py-8">
          {children}
        </main>
        <footer className="border-t bg-background/80 px-3 py-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <MedicalDisclaimer compact />
          </div>
        </footer>
      </div>
    </div>
  )
}
