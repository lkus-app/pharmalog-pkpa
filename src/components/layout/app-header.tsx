"use client"

import { UserRound } from "lucide-react"
import Link from "next/link"
import { useAppStore } from "@/components/app-store-provider"
import { Brand } from "@/components/layout/brand"
import { MobileNav } from "@/components/layout/mobile-nav"
import { SearchBar } from "@/components/shared/search-bar"

export function AppHeader() {
  const { data, hydrated } = useAppStore()
  const name = hydrated ? data?.profile?.name || "" : ""

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-3 sm:px-5">
        <MobileNav />
        <div className="lg:hidden">
          <Brand compact />
        </div>
        <div className="hidden min-w-0 flex-1 lg:block">
          <SearchBar className="max-w-xl" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-emerald-500 hover:text-emerald-700"
          >
            <UserRound className="size-4 text-slate-500" />
            <span className="hidden max-w-36 truncate sm:inline">
              {name || "Profil PKPA"}
            </span>
          </Link>
        </div>
      </div>
      <div className="border-t px-3 py-2 lg:hidden">
        <SearchBar />
      </div>
    </header>
  )
}
