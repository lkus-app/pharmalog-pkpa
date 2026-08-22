import {
  BookOpen,
  FolderKanban,
  LayoutDashboard,
  Shield,
  TrendingUp,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import type { UserRole } from "@/lib/types"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const STUDENT_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learning", label: "Pembelajaran", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/portfolio", label: "Portofolio", icon: FolderKanban },
  { href: "/profile", label: "Profil", icon: UserRound },
]

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard Admin", icon: Shield },
  { href: "/profile", label: "Profil", icon: UserRound },
]

export function getNavItems(role: UserRole | undefined): NavItem[] {
  return role === "admin" ? ADMIN_NAV_ITEMS : STUDENT_NAV_ITEMS
}

export const NAV_ITEMS = STUDENT_NAV_ITEMS
