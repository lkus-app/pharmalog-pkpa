import React, { useState, useEffect } from "react"
import { AppStoreProvider, useAppStore } from "@/components/app-store-provider"
import { AppHeader } from "@/components/layout/app-header"
import { LearningView } from "@/components/learning/learning-view"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { ProgressView } from "@/components/progress/progress-view"
import { PortfolioView } from "@/components/portfolio/portfolio-view"
import { ProfileView } from "@/components/profile/profile-view"
import { AdminView } from "@/components/admin/admin-view"
import { IdentityGate } from "@/components/auth/identity-gate"
import {
  BookOpen,
  CheckCircle2,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Shield,
  User,
  Database,
  Wifi,
  WifiOff,
} from "lucide-react"

type ActiveTab = "dashboard" | "learning" | "progress" | "portfolio" | "profile" | "admin"

function MainAppShell() {
  const { data, hydrated, isCloudConnected, isAdmin } = useAppStore()
  const [activeTab, setActiveTab] = useState<ActiveTab>("learning")

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
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">PharmaLog PKPA</span>
              <span className="hidden sm:inline-block ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                E-Logbook Farmasi
              </span>
            </div>
          </div>

          {/* Sync status & Profile info */}
          <div className="flex items-center gap-3">
            <div
              className={`hidden md:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
                isCloudConnected
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
              title={isCloudConnected ? "Tersinkronisasi ke Cloud Supabase" : "Penyimpanan Lokal Aktif (Offline First)"}
            >
              {isCloudConnected ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
              <span>{isCloudConnected ? "Cloud Aktif" : "Local Mode"}</span>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
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
                onClick={() => setActiveTab("dashboard")}
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
                onClick={() => setActiveTab("learning")}
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
                onClick={() => setActiveTab("progress")}
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
                onClick={() => setActiveTab("portfolio")}
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
                onClick={() => setActiveTab("profile")}
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
                  onClick={() => setActiveTab("admin")}
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

      {/* Main Tab Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
        {activeTab === "dashboard" && <DashboardView />}
        {activeTab === "learning" && <LearningView />}
        {activeTab === "progress" && <ProgressView />}
        {activeTab === "portfolio" && <PortfolioView />}
        {activeTab === "profile" && <ProfileView />}
        {activeTab === "admin" && <AdminView />}
      </main>

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
