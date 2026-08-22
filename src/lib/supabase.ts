import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const LOCAL_STORAGE_URL_KEY = "pharmalog_supabase_url"
const LOCAL_STORAGE_KEY_KEY = "pharmalog_supabase_anon_key"

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  let url = ""
  let anonKey = ""

  // 1. Cek LocalStorage jika di browser
  if (typeof window !== "undefined") {
    try {
      const localUrl = window.localStorage.getItem(LOCAL_STORAGE_URL_KEY)
      const localKey = window.localStorage.getItem(LOCAL_STORAGE_KEY_KEY)
      if (localUrl) url = localUrl.trim()
      if (localKey) anonKey = localKey.trim()
    } catch {
      // Ignore
    }
  }

  // 2. Cek import.meta.env (Vite)
  if (!url || !anonKey) {
    try {
      const meta = (import.meta as any).env || {}
      url = url || meta.VITE_SUPABASE_URL || meta.NEXT_PUBLIC_SUPABASE_URL || ""
      anonKey = anonKey || meta.VITE_SUPABASE_ANON_KEY || meta.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    } catch {
      // Ignore
    }
  }

  // 3. Cek process.env jika ada
  if (!url || !anonKey) {
    try {
      if (typeof process !== "undefined" && process.env) {
        url = url || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
        anonKey = anonKey || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      }
    } catch {
      // Ignore
    }
  }

  return { url, anonKey }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials()
  return Boolean(
    url &&
      anonKey &&
      url.startsWith("http") &&
      anonKey.length > 10
  )
}

let cachedClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null
  }
  const { url, anonKey } = getSupabaseCredentials()
  if (!cachedClient) {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  return cachedClient
}

export const supabase = getSupabaseClient()

export function saveSupabaseConfig(url: string, anonKey: string): boolean {
  if (typeof window === "undefined") return false
  try {
    const cleanUrl = url.trim()
    const cleanKey = anonKey.trim()
    if (cleanUrl && cleanKey) {
      window.localStorage.setItem(LOCAL_STORAGE_URL_KEY, cleanUrl)
      window.localStorage.setItem(LOCAL_STORAGE_KEY_KEY, cleanKey)
      cachedClient = createClient(cleanUrl, cleanKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      })
      return true
    }
  } catch (e) {
    console.error("Gagal simpan konfigurasi Supabase:", e)
  }
  return false
}

export function clearSupabaseConfig(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(LOCAL_STORAGE_URL_KEY)
    window.localStorage.removeItem(LOCAL_STORAGE_KEY_KEY)
    cachedClient = null
  } catch (e) {
    console.error("Gagal hapus konfigurasi Supabase:", e)
  }
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient()
  if (!client) {
    return { success: false, message: "URL Supabase atau Anon Key belum terpasang." }
  }
  try {
    const { error } = await client.from("students").select("id").limit(1)
    if (error) {
      // Jika tabel students ada atau permission error tapi terhubung
      if (error.code === "PGRST116" || error.code === "42P01") {
        return { success: false, message: `Tabel database belum siap: ${error.message}` }
      }
      return { success: false, message: `Supabase merespons dengan error: ${error.message}` }
    }
    return { success: true, message: "Koneksi ke database Supabase berhasil!" }
  } catch (err: any) {
    return { success: false, message: `Gagal menghubungi Supabase: ${err.message || "Periksa URL"}` }
  }
}

