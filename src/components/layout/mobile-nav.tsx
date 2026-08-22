"use client"

import { LogOut, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useAppStore } from "@/components/app-store-provider"
import { Brand } from "@/components/layout/brand"
import { getNavItems } from "@/components/layout/nav-config"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { session, logout } = useAppStore()
  const items = getNavItems(session?.role)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon" className="lg:hidden" aria-label="Buka menu" />
        }
      >
        <Menu className="size-4" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-[#0f2c59] p-0 text-white">
        <SheetHeader className="border-b border-white/10">
          <SheetTitle className="sr-only">Navigasi PharmaLog</SheetTitle>
          <Brand inverted />
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-3">
          {items.map((item) => {
            const Icon = item.icon
            const active = isActivePath(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium",
                  active ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
          <button
            type="button"
            className="mt-2 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/80 hover:bg-white/10"
            onClick={() => {
              setOpen(false)
              void logout()
            }}
          >
            <LogOut className="size-4" />
            Keluar
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
