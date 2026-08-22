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
import { LogOut } from "lucide-react"

export function ProfileView() {
  const { hydrated } = useAppStore()
  if (!hydrated) return <PageSkeleton />
  return <ProfileForm />
}

function ProfileForm() {
  const { data, setProfile, saveStatus, isAdmin, logout } = useAppStore()
  const [profile, setLocalProfile] = useState<StudentProfile>(data?.profile || EMPTY_PROFILE)
  const [dirty, setDirty] = useState(false)

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
