import React, { useState, useEffect } from "react"
import { AppStoreProvider, useAppStore } from "@/components/app-store-provider"
import { LearningView } from "@/components/learning/learning-view"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { ProgressView } from "@/components/progress/progress-view"
import { PortfolioView } from "@/components/portfolio/portfolio-view"
import { ProfileView } from "@/components/profile/profile-view"
import { AdminView } from "@/components/admin/admin-view"
import TherapyDetailPage from "@/app/learning/[therapyId]/page"
import DrugDetailPage from "@/app/learning/[therapyId]/[drugId]/page"
import { SupabaseConfigModal } from "@/components/shared/supabase-config-modal"
import { IdentityGate } from "@/components/auth/identity-gate"
import {
  BookOpen,
  CheckCircle2,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Shield,
  User,
  Wifi,
  WifiOff,
} from "lucide-react"

type ActiveTab = "dashboard" | "learning" | "progress" | "portfolio" | "profile" | "admin"

type AppRoute =
  | { type: "dashboard" }
  | { type: "learning" }
  | { type: "therapy"; therapyId: string }
  | { type: "drug"; therapyId: string; drugId: string }
  | { type: "progress" }
  | { type: "portfolio" }
  | { type: "profile" }
  | { type: "admin" }

function parseCurrentRoute(): AppRoute {
  if (typeof window === "undefined") return { type: "dashboard" }
  const rawHash = window.location.hash ? window.location.hash.slice(1) : "/"
  const cleanPath = rawHash.split("?")[0].replace(/^#/, "")
  const parts = cleanPath.split("/").filter(Boolean)

  if (parts.length === 0 || parts[0] === "dashboard") {
    return { type: "dashboard" }
  }
  if (parts[0] === "learning") {
    if (parts[1] && parts[2]) {
      return {
        type: "drug",
        therapyId: decodeURIComponent(parts[1]),
        drugId: decodeURIComponent(parts[2]),
      }
    }
    if (parts[1]) {
      return {
        type: "therapy",
        therapyId: decodeURIComponent(parts[1]),
      }
    }
    return { type: "learning" }
  }
  if (parts[0] === "progress") return { type: "progress" }
  if (parts[0] === "portfolio") return { type: "portfolio" }
  if (parts[0] === "profile") return { type: "profile" }
  if (parts[0] === "admin") return { type: "admin" }

  return { type: "learning" }
}

function MainAppShell() {
  const { data, hydrated, isCloudConnected, isAdmin } = useAppStore()
  const [route, setRoute] = useState<AppRoute>(parseCurrentRoute)
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false)

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseCurrentRoute())
      window.scrollTo({ top: 0, behavior: "smooth" })
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  const navigateTo = (path: string) => {
    window.location.hash = path
    window.dispatchEvent(new HashChangeEvent("hashchange"))
  }

  // Menentukan tab aktif dari route
  const getActiveTab = (): ActiveTab => {
    if (route.type === "dashboard") return "dashboard"
    if (route.type === "learning" || route.type === "therapy" || route.type === "drug") return "learning"
    if (route.type === "progress") return "progress"
    if (route.type === "portfolio") return "portfolio"
    if (route.type === "profile") return "profile"
    if (route.type === "admin") return "admin"
    return "learning"
  }

  const activeTab = getActiveTab()

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-700">Menyiapkan PharmaLog PKPA...</p>
        </div>
      </div>
    )
  }

  // Jika belum login / belum ada profile
  if (!data?.profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <IdentityGate />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigateTo("/learning")}
            className="flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">PharmaLog PKPA</span>
              <span className="hidden sm:inline-block ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                E-Logbook Farmasi
              </span>
            </div>
          </button>

          {/* Sync status & Profile info */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSupabaseModalOpen(true)}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition cursor-pointer hover:shadow-xs ${
                isCloudConnected
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
              }`}
              title="Klik untuk melihat atau mengatur koneksi Supabase"
            >
              {isCloudConnected ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
              <span>{isCloudConnected ? "Cloud Aktif" : "Local Mode"}</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo("/profile")}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <User className="size-4 text-slate-500" />
              <span className="max-w-[120px] truncate">{data.profile.name || "Profil"}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="border-t border-slate-100 bg-white">
          <div className="mx-auto flex max-w-7xl overflow-x-auto px-4 sm:px-6">
            <nav className="flex space-x-1 sm:space-x-2 py-1.5">
              <button
                type="button"
                onClick={() => navigateTo("/dashboard")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition ${
                  activeTab === "dashboard"
                    ? "bg-emerald-50 text-emerald-700 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <LayoutDashboard className="size-4" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo("/learning")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition ${
                  activeTab === "learning"
                    ? "bg-emerald-50 text-emerald-700 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <BookOpen className="size-4" />
                <span>Pembelajaran (23 Terapi)</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo("/progress")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition ${
                  activeTab === "progress"
                    ? "bg-emerald-50 text-emerald-700 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <CheckCircle2 className="size-4" />
                <span>Progres Belajar</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo("/portfolio")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition ${
                  activeTab === "portfolio"
                    ? "bg-emerald-50 text-emerald-700 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <FolderKanban className="size-4" />
                <span>Portofolio &amp; Cetak</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo("/profile")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition ${
                  activeTab === "profile"
                    ? "bg-emerald-50 text-emerald-700 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <User className="size-4" />
                <span>Profil</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigateTo("/admin")}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition ${
                    activeTab === "admin"
                      ? "bg-purple-50 text-purple-700 font-bold"
                      : "text-purple-600 hover:bg-purple-50"
                  }`}
                >
                  <Shield className="size-4" />
                  <span>Admin</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Tab & Route Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
        {route.type === "dashboard" && <DashboardView />}
        {route.type === "learning" && <LearningView />}
        {route.type === "therapy" && <TherapyDetailPage />}
        {route.type === "drug" && <DrugDetailPage />}
        {route.type === "progress" && <ProgressView />}
        {route.type === "portfolio" && <PortfolioView />}
        {route.type === "profile" && <ProfileView />}
        {route.type === "admin" && <AdminView />}
      </main>

      {/* Supabase Config Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>PharmaLog PKPA &bull; Sistem E-Logbook &amp; Portofolio Pembelajaran Praktek Kerja Profesi Apoteker</p>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AppStoreProvider>
      <MainAppShell />
    </AppStoreProvider>
  )
}

