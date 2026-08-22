"use client"

import type { ReactNode } from "react"
import { useAppStore } from "@/components/app-store-provider"
import { IdentityGate } from "@/components/auth/identity-gate"
import { PageSkeleton } from "@/components/shared/page-skeleton"

export function AuthGate({ children }: { children: ReactNode }) {
  const { hydrated, session } = useAppStore()

  if (!hydrated) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[oklch(0.975_0.01_250)] p-6">
        <div className="w-full max-w-3xl">
          <PageSkeleton />
        </div>
      </div>
    )
  }

  if (!session) return <IdentityGate />
  return children
}
