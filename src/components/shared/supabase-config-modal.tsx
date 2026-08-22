"use client"

import React, { useState, useEffect } from "react"
import { useAppStore } from "@/components/app-store-provider"
import {
  getSupabaseCredentials,
  testSupabaseConnection,
  saveSupabaseConfig,
  clearSupabaseConfig,
} from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  X,
  ExternalLink,
  Wifi,
  WifiOff,
} from "lucide-react"

interface SupabaseConfigModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SupabaseConfigModal({ isOpen, onClose }: SupabaseConfigModalProps) {
  const { isCloudConnected, isAdmin, refreshData } = useAppStore()
  const [url, setUrl] = useState("")
  const [anonKey, setAnonKey] = useState("")
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    if (isOpen && isAdmin) {
      const creds = getSupabaseCredentials()
      setUrl(creds.url || "")
      setAnonKey(creds.anonKey || "")
      setTestResult(null)
    }
  }, [isOpen, isAdmin])

  if (!isOpen || !isAdmin) return null

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsTesting(true)
    setTestResult(null)

    const cleanUrl = url.trim()
    const cleanKey = anonKey.trim()

    if (!cleanUrl || !cleanKey) {
      setTestResult({
        success: false,
        message: "Harap isi URL Project Supabase dan Anon/Public Key.",
      })
      setIsTesting(false)
      return
    }

    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      setTestResult({
        success: false,
        message: "URL Supabase harus dimulai dengan https://",
      })
      setIsTesting(false)
      return
    }

    saveSupabaseConfig(cleanUrl, cleanKey)

    const res = await testSupabaseConnection()
    setTestResult(res)
    setIsTesting(false)

    if (res.success) {
      await refreshData()
    }
  }

  const handleClear = async () => {
    clearSupabaseConfig()
    setUrl("")
    setAnonKey("")
    setTestResult({
      success: true,
      message: "Konfigurasi Supabase telah dihapus. Aplikasi kembali ke Local Storage Mode.",
    })
    await refreshData()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border bg-white p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Database className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Koneksi Database Supabase</h3>
              <p className="text-xs text-muted-foreground">
                Hubungkan penyimpanan cloud agar data PKPA tersinkronisasi lintas perangkat.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Current Status Badge */}
        <div
          className={`flex items-center justify-between rounded-xl p-3.5 border ${
            isCloudConnected
              ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
              : "bg-amber-50/80 border-amber-200 text-amber-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isCloudConnected ? (
              <Wifi className="size-5 text-emerald-600 shrink-0" />
            ) : (
              <WifiOff className="size-5 text-amber-600 shrink-0" />
            )}
            <div>
              <p className="text-xs font-bold">
                {isCloudConnected ? "Status: Cloud Supabase Terhubung" : "Status: Mode Lokal (Offline-First)"}
              </p>
              <p className="text-[11px] opacity-80">
                {isCloudConnected
                  ? "Catatan logbook dan progres Anda tersimpan otomatis di Supabase."
                  : "Data tersimpan di browser perangkat ini. Masukkan kredensial Supabase untuk mengaktifkan sinkronisasi cloud."}
              </p>
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="supa-url" className="text-xs font-semibold">
              Project URL Supabase
            </Label>
            <Input
              id="supa-url"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="supa-key" className="text-xs font-semibold">
              Anon Public API Key
            </Label>
            <Input
              id="supa-key"
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="text-xs h-9 font-mono"
            />
          </div>

          {testResult && (
            <div
              className={`flex items-start gap-2 rounded-lg p-3 text-xs border ${
                testResult.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <p className="leading-relaxed">{testResult.message}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
            {isCloudConnected ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1.5"
              >
                <Trash2 className="size-3.5" />
                <span>Putuskan Koneksi</span>
              </Button>
            ) : (
              <span className="text-[11px] text-muted-foreground">
                Kredensial disimpan aman di browser.
              </span>
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
                Tutup
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isTesting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Menguji...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    <span>Tes &amp; Simpan</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
