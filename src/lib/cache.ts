import { CACHE_STORAGE_PREFIX } from "@/lib/constants"
import { DEFAULT_APP_DATA, normalizeAppData } from "@/lib/storage"
import type { AppData } from "@/lib/types"

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

export function readWorkspaceCache(studentId: string): AppData | null {
  if (!isBrowser() || !studentId) return null
  try {
    const raw = window.localStorage.getItem(`${CACHE_STORAGE_PREFIX}${studentId}`)
    if (!raw) return null
    return normalizeAppData(JSON.parse(raw))
  } catch {
    return null
  }
}

export function writeWorkspaceCache(studentId: string, data: AppData) {
  if (!isBrowser() || !studentId) return
  try {
    window.localStorage.setItem(`${CACHE_STORAGE_PREFIX}${studentId}`, JSON.stringify(data))
  } catch (error) {
    console.warn("[PharmaLog] Failed to write cache", error)
  }
}

export function clearWorkspaceCache(studentId?: string) {
  if (!isBrowser()) return
  try {
    if (studentId) {
      window.localStorage.removeItem(`${CACHE_STORAGE_PREFIX}${studentId}`)
      return
    }
    const keys: string[] = []
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index)
      if (key?.startsWith(CACHE_STORAGE_PREFIX)) keys.push(key)
    }
    keys.forEach((key) => window.localStorage.removeItem(key))
  } catch {
    /* ignore */
  }
}

export { DEFAULT_APP_DATA }
