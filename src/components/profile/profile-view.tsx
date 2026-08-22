"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/components/app-store-provider"
import { PageHeader } from "@/components/shared/page-header"
import { PageSkeleton } from "@/components/shared/page-skeleton"
import { SaveIndicator } from "@/components/shared/save-indicator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { EMPTY_PROFILE } from "@/lib/constants"
import type { StudentProfile } from "@/lib/types"
import { LogOut, Database, Wifi, WifiOff, Settings } from "lucide-react"
import { SupabaseConfigModal } from "@/components/shared/supabase-config-modal"

export function ProfileView() {
  const { hydrated } = useAppStore()
  if (!hydrated) return <PageSkeleton />
  return <ProfileForm />
}

function ProfileForm() {
  const { data, setProfile, saveStatus, isAdmin, isCloudConnected, logout } = useAppStore()
  const [profile, setLocalProfile] = useState<StudentProfile>(data?.profile || EMPTY_PROFILE)
  const [dirty, setDirty] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (data?.profile) {
      setLocalProfile(data.profile)
    }
  }, [data?.profile])

  useEffect(() => {
    if (!dirty) return
    const timer = window.setTimeout(() => {
      setProfile(profile)
      setDirty(false)
    }, 400)
    return () => window.clearTimeout(timer)
  }, [dirty, profile, setProfile])

  function updateField(key: "pharmacy" | "preceptor" | "period" | "pharmacyName" | "preceptorName", value: string) {
    setLocalProfile((current) => ({
      ...current,
      [key]: value,
      pharmacy: key === "pharmacyName" || key === "pharmacy" ? value : current.pharmacy,
      pharmacyName: key === "pharmacyName" || key === "pharmacy" ? value : current.pharmacyName,
      preceptor: key === "preceptorName" || key === "preceptor" ? value : current.preceptor,
      preceptorName: key === "preceptorName" || key === "preceptor" ? value : current.preceptorName,
    }))
    setDirty(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profil"
        title="Data Mahasiswa PKPA"
        description="Nama dan NIM mengunci identitas Anda. Lengkapi apotek, preseptor, dan periode untuk halaman sampul portofolio."
        actions={
          <div className="flex items-center gap-3">
            <SaveIndicator status={saveStatus} />
            <Button variant="outline" size="sm" onClick={logout} className="gap-1.5 text-rose-600 hover:text-rose-700">
              <LogOut className="size-3.5" />
              <span>Keluar</span>
            </Button>
          </div>
        }
      />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Identitas Mahasiswa</CardTitle>
          <CardDescription>
            Nama lengkap dan NIM diisi saat masuk dan tersimpan pada data logbook Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Mahasiswa</Label>
            <Input id="name" value={profile.name || ""} className="h-9 bg-muted" readOnly />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nim">NIM</Label>
            <Input id="nim" value={profile.nim || ""} className="h-9 bg-muted" readOnly />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pharmacy">Apotek / Wahana PKPA</Label>
            <Input
              id="pharmacy"
              value={profile.pharmacyName || profile.pharmacy || ""}
              placeholder="Contoh: Apotek Kimia Farma / RSUD"
              className="h-9 bg-background"
              onChange={(event) => updateField("pharmacyName", event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="preceptor">Apoteker Preseptor</Label>
            <Input
              id="preceptor"
              value={profile.preceptorName || profile.preceptor || ""}
              placeholder="Contoh: apt. Ahmad, S.Farm"
              className="h-9 bg-background"
              onChange={(event) => updateField("preceptorName", event.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="period">Periode PKPA</Label>
            <Input
              id="period"
              value={profile.period || ""}
              placeholder="Contoh: Agustus – September 2026"
              className="h-9 bg-background"
              onChange={(event) => updateField("period", event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card Status Penyimpanan Database & Supabase */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="size-5 text-emerald-600" />
              <CardTitle>Sinkronisasi Supabase</CardTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Settings className="size-3.5" />
              <span>Kelola Koneksi</span>
            </Button>
          </div>
          <CardDescription>
            Status koneksi penyimpanan data klinis ke Cloud Database Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`flex items-center justify-between rounded-xl border p-4 ${
              isCloudConnected
                ? "border-emerald-200 bg-emerald-50/50"
                : "border-amber-200 bg-amber-50/50"
            }`}
          >
            <div className="flex items-center gap-3">
              {isCloudConnected ? (
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Wifi className="size-5" />
                </div>
              ) : (
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <WifiOff className="size-5" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {isCloudConnected ? "Cloud Supabase Aktif & Tersambung" : "Mode Lokal (Offline-First)"}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isCloudConnected
                    ? "Setiap perubahan catatan otomatis disinkronkan ke Supabase."
                    : "Data disimpan di LocalStorage perangkat ini. Klik tombol di atas untuk menyambungkan Supabase URL & Key."}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant={isCloudConnected ? "outline" : "default"}
              onClick={() => setIsModalOpen(true)}
              className={isCloudConnected ? "text-xs" : "bg-emerald-600 hover:bg-emerald-700 text-white text-xs"}
            >
              {isCloudConnected ? "Pengaturan" : "Sambungkan Supabase"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <SupabaseConfigModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {isAdmin ? (
        <p className="text-xs text-muted-foreground">
          Akun ini memiliki hak akses Admin PKPA. Fitur manajemen mahasiswa tersedia di menu Admin.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Gunakan NIM yang sama di perangkat lain untuk memuat catatan logbook Anda.
        </p>
      )}
    </div>
  )
}
