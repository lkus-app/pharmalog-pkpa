"use client"

import { LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppStore } from "@/components/app-store-provider"
import { Brand } from "@/components/layout/brand"
import { getNavItems } from "@/components/layout/nav-config"
import { cn } from "@/lib/utils"

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar() {
  const pathname = usePathname()
  const { session, logout, isAdmin } = useAppStore()
  const items = getNavItems(session?.role)

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-[#0f2c59] text-white lg:flex">
      <div className="border-b border-white/10 px-4 py-5">
        <Brand inverted />
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => {
          const Icon = item.icon
          const active = isActivePath(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="text-[11px] leading-relaxed text-white/60">
          {isAdmin
            ? "Mode admin — Anda dapat melihat dan mengunduh portofolio seluruh mahasiswa."
            : "Catatan tersimpan di cloud dan terikat ke NIM Anda."}
        </p>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-white/80 hover:text-white"
        >
          <LogOut className="size-3.5" />
          Keluar
        </button>
      </div>
    </aside>
  )
}
