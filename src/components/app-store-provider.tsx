"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  DEFAULT_APP_DATA,
  normalizeAppData,
  sanitizeNotes,
} from "@/lib/storage"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import type {
  AppData,
  DrugNotes,
  StudentProfile,
  SaveStatus,
} from "@/lib/types"

export type { SaveStatus }
import {
  fetchWorkspace,
  saveDrugNotes,
  saveDrugView,
  saveFavorite,
  saveStudentProfile,
  resetStudentLearning,
} from "@/lib/workspace"

const STORAGE_KEY_PREFIX = "pharmalog_workspace_v1_"
const ACTIVE_STUDENT_KEY = "pharmalog_active_student_nim"

interface AppStoreContextType {
  data: AppData
  session: StudentProfile | null
  user: StudentProfile | null
  isAdmin: boolean
  hydrated: boolean
  isLoading: boolean
  configured: boolean
  saveStatus: SaveStatus
  enter: (
    name: string,
    nim: string,
    pharmacy?: string,
    preceptor?: string,
    period?: string
  ) => Promise<StudentProfile>
  setProfile: (profile: Partial<StudentProfile>) => Promise<void>
  saveEntry: (
    drugId: string,
    therapyId: string,
    notes: DrugNotes,
    completed?: boolean
  ) => Promise<void>
  toggleComplete: (
    drugId: string,
    therapyId: string,
    completed: boolean
  ) => Promise<void>
  toggleFavorite: (drugId: string) => Promise<void>
  isFavorite: (drugId: string) => boolean
  recordRecent: (drugId: string, therapyId: string) => Promise<void>
  viewTherapy: (therapyId: string) => void
  viewDrug: (drugId: string, therapyId: string) => void
  resetProgress: () => Promise<void>
  resetData: () => Promise<void>
  exportBackup: () => string
  importBackup: (jsonString: string) => Promise<boolean>
  logout: () => void
  refreshData: () => Promise<void>
}

const AppStoreContext = createContext<AppStoreContextType | null>(null)

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(DEFAULT_APP_DATA)
  const [hydrated, setHydrated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved")

  const configured = useMemo(() => isSupabaseConfigured(), [])

  const saveToLocalStorage = useCallback((appData: AppData) => {
    if (typeof window === "undefined") return
    try {
      const nim = appData.profile?.nim?.trim() || "default"
      const key = `${STORAGE_KEY_PREFIX}${nim}`
      window.localStorage.setItem(key, JSON.stringify(appData))
      if (appData.profile?.nim) {
        window.localStorage.setItem(ACTIVE_STUDENT_KEY, appData.profile.nim)
      }
    } catch (e) {
      console.warn("Gagal menyimpan ke LocalStorage:", e)
    }
  }, [])

  const loadStudentWorkspace = useCallback(
    async (profile: StudentProfile) => {
      setIsLoading(true)
      const nim = profile.nim.trim()
      let currentData: AppData = {
        ...DEFAULT_APP_DATA,
        profile,
      }

      // 1. Coba muat dari LocalStorage dulu
      try {
        const localRaw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${nim}`)
        if (localRaw) {
          const parsed = JSON.parse(localRaw)
          currentData = normalizeAppData({ ...parsed, profile })
        }
      } catch (e) {
        console.warn("Gagal parse local storage data:", e)
      }

      // 2. Jika Supabase aktif dan profile.id ada (dan bukan dummy local-), coba sync dari Supabase
      if (configured && profile.id && !profile.id.startsWith("local-")) {
        try {
          const remoteData = await fetchWorkspace(profile.id)
          if (remoteData) {
            currentData = {
              profile: {
                ...profile,
                ...(remoteData.profile || {}),
              },
              entries: {
                ...currentData.entries,
                ...(remoteData.entries || {}),
              },
              favorites: Array.from(
                new Set([...(currentData.favorites || []), ...(remoteData.favorites || [])])
              ),
              recent: remoteData.recent?.length ? remoteData.recent : currentData.recent,
              lastVisited: currentData.lastVisited,
            }
          }
        } catch (err) {
          console.warn("Gagal sync dari Supabase:", err)
        }
      }

      setData(currentData)
      saveToLocalStorage(currentData)
      setIsLoading(false)
      return currentData
    },
    [configured, saveToLocalStorage]
  )

  // Inisialisasi saat pertama kali mount
  useEffect(() => {
    async function init() {
      try {
        const activeNim = window.localStorage.getItem(ACTIVE_STUDENT_KEY)
        if (activeNim) {
          const localRaw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${activeNim}`)
          if (localRaw) {
            const parsed = JSON.parse(localRaw)
            const normalized = normalizeAppData(parsed)
            if (normalized.profile) {
              setData(normalized)
              if (configured && normalized.profile.id && !normalized.profile.id.startsWith("local-")) {
                loadStudentWorkspace(normalized.profile)
              }
            }
          }
        }
      } catch (err) {
        console.error("Init store error:", err)
      } finally {
        setHydrated(true)
      }
    }
    init()
  }, [configured, loadStudentWorkspace])

  const enter = useCallback(
    async (
      name: string,
      nim: string,
      pharmacy?: string,
      preceptor?: string,
      period?: string
    ) => {
      setIsLoading(true)
      setSaveStatus("saving")
      const cleanName = name.trim()
      const cleanNim = nim.trim()
      const isAdmin = cleanNim.toUpperCase() === "ADMIN001"

      let studentProfile: StudentProfile = {
        id: `local-${cleanNim.toLowerCase()}`,
        name: cleanName,
        nim: cleanNim,
        pharmacy: pharmacy || "",
        pharmacyName: pharmacy || "",
        preceptor: preceptor || "",
        preceptorName: preceptor || "",
        period: period || "",
        role: isAdmin ? "admin" : "student",
      }

      // Coba autentikasi via API / Supabase jika online dan ada koneksi
      if (typeof window !== "undefined") {
        try {
          const res = await fetch("/api/auth/enter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: cleanName, nim: cleanNim }),
          })
          if (res.ok) {
            const json = await res.json()
            if (json?.student) {
              studentProfile = {
                id: json.student.id,
                name: json.student.name || cleanName,
                nim: json.student.nim || cleanNim,
                pharmacy: json.student.pharmacy || json.student.pharmacy_name || pharmacy || "",
                pharmacyName: json.student.pharmacy_name || json.student.pharmacy || pharmacy || "",
                preceptor: json.student.preceptor || json.student.preceptor_name || preceptor || "",
                preceptorName: json.student.preceptor_name || json.student.preceptor || preceptor || "",
                period: json.student.period || period || "",
                role: json.student.role || (isAdmin ? "admin" : "student"),
              }
            }
          }
        } catch (e) {
          console.warn("Auth API tidak dapat dijangkau, menggunakan local profile fallback:", e)
        }
      }

      const workspace = await loadStudentWorkspace(studentProfile)
      setSaveStatus("saved")
      setIsLoading(false)
      return workspace.profile || studentProfile
    },
    [loadStudentWorkspace]
  )

  const setProfile = useCallback(
    async (patch: Partial<StudentProfile>) => {
      setData((prev) => {
        if (!prev.profile) return prev
        const updated: StudentProfile = {
          ...prev.profile,
          ...patch,
          pharmacy: patch.pharmacyName ?? patch.pharmacy ?? prev.profile.pharmacy,
          pharmacyName: patch.pharmacyName ?? patch.pharmacy ?? prev.profile.pharmacyName,
          preceptor: patch.preceptorName ?? patch.preceptor ?? prev.profile.preceptor,
          preceptorName: patch.preceptorName ?? patch.preceptor ?? prev.profile.preceptorName,
        }
        const nextData = { ...prev, profile: updated }
        saveToLocalStorage(nextData)

        if (configured && updated.id && !updated.id.startsWith("local-")) {
          saveStudentProfile(updated).catch(console.warn)
        }

        return nextData
      })
    },
    [configured, saveToLocalStorage]
  )

  const saveEntry = useCallback(
    async (
      drugId: string,
      therapyId: string,
      notes: DrugNotes,
      completed?: boolean
    ) => {
      setSaveStatus("saving")
      const sanitized = sanitizeNotes(notes)

      setData((prev) => {
        const prevEntry = prev.entries[drugId]
        const isDone = completed !== undefined ? completed : Boolean(prevEntry?.markedComplete)

        const nextEntries = {
          ...prev.entries,
          [drugId]: {
            notes: sanitized,
            markedComplete: isDone,
            updatedAt: new Date().toISOString(),
          },
        }

        const nextData = { ...prev, entries: nextEntries }
        saveToLocalStorage(nextData)

        if (configured && prev.profile?.id && !prev.profile.id.startsWith("local-")) {
          saveDrugNotes({
            studentId: prev.profile.id,
            therapyId,
            drugId,
            notes: sanitized,
            completed: isDone,
          }).catch(console.warn)
        }

        return nextData
      })

      setSaveStatus("saved")
    },
    [configured, saveToLocalStorage]
  )

  const toggleComplete = useCallback(
    async (drugId: string, therapyId: string, completed: boolean) => {
      setData((prev) => {
        const existing = prev.entries[drugId]
        const notes = existing?.notes || sanitizeNotes(null)

        const nextEntries = {
          ...prev.entries,
          [drugId]: {
            notes,
            markedComplete: completed,
            updatedAt: new Date().toISOString(),
          },
        }

        const nextData = { ...prev, entries: nextEntries }
        saveToLocalStorage(nextData)

        if (configured && prev.profile?.id && !prev.profile.id.startsWith("local-")) {
          saveDrugNotes({
            studentId: prev.profile.id,
            therapyId,
            drugId,
            notes,
            completed,
          }).catch(console.warn)
        }

        return nextData
      })
    },
    [configured, saveToLocalStorage]
  )

  const toggleFavorite = useCallback(
    async (drugId: string) => {
      setData((prev) => {
        const exists = prev.favorites.includes(drugId)
        const nextFavs = exists
          ? prev.favorites.filter((id) => id !== drugId)
          : [...prev.favorites, drugId]

        const nextData = { ...prev, favorites: nextFavs }
        saveToLocalStorage(nextData)

        if (configured && prev.profile?.id && !prev.profile.id.startsWith("local-")) {
          saveFavorite(prev.profile.id, drugId, !exists).catch(console.warn)
        }

        return nextData
      })
    },
    [configured, saveToLocalStorage]
  )

  const isFavorite = useCallback(
    (drugId: string) => {
      return Boolean(data.favorites?.includes(drugId))
    },
    [data.favorites]
  )

  const recordRecent = useCallback(
    async (drugId: string, therapyId: string) => {
      setData((prev) => {
        const filtered = (prev.recent || []).filter((r) => r.drugId !== drugId)
        const nextRecent = [
          { drugId, therapyId, viewedAt: new Date().toISOString() },
          ...filtered,
        ].slice(0, 20)

        const nextData = { ...prev, recent: nextRecent }
        saveToLocalStorage(nextData)

        if (configured && prev.profile?.id && !prev.profile.id.startsWith("local-")) {
          saveDrugView(prev.profile.id, drugId, therapyId).catch(console.warn)
        }

        return nextData
      })
    },
    [configured, saveToLocalStorage]
  )

  const viewTherapy = useCallback(
    (therapyId: string) => {
      setData((prev) => {
        const nextData = {
          ...prev,
          lastVisited: {
            therapyId,
            path: `/learning/${therapyId}`,
            label: `Terapi ${therapyId}`,
          },
        }
        saveToLocalStorage(nextData)
        return nextData
      })
    },
    [saveToLocalStorage]
  )

  const viewDrug = useCallback(
    (drugId: string, therapyId: string) => {
      recordRecent(drugId, therapyId)
      setData((prev) => {
        const nextData = {
          ...prev,
          lastVisited: {
            therapyId,
            drugId,
            path: `/learning/${therapyId}/${drugId}`,
            label: `Obat ${drugId}`,
          },
        }
        saveToLocalStorage(nextData)
        return nextData
      })
    },
    [recordRecent, saveToLocalStorage]
  )

  const resetProgress = useCallback(async () => {
    setData((prev) => {
      const nextData: AppData = {
        ...prev,
        entries: {},
        favorites: [],
        recent: [],
        lastVisited: undefined,
      }
      saveToLocalStorage(nextData)

      if (configured && prev.profile?.id && !prev.profile.id.startsWith("local-")) {
        resetStudentLearning(prev.profile.id).catch(console.warn)
      }

      return nextData
    })
  }, [configured, saveToLocalStorage])

  const resetData = useCallback(async () => {
    await resetProgress()
  }, [resetProgress])

  const exportBackup = useCallback(() => {
    return JSON.stringify(data, null, 2)
  }, [data])

  const importBackup = useCallback(
    async (jsonString: string) => {
      try {
        const parsed = JSON.parse(jsonString)
        const normalized = normalizeAppData(parsed)
        setData(normalized)
        saveToLocalStorage(normalized)
        return true
      } catch (err) {
        console.error("Gagal import backup:", err)
        return false
      }
    },
    [saveToLocalStorage]
  )

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ACTIVE_STUDENT_KEY)
    }
    setData(DEFAULT_APP_DATA)
  }, [])

  const refreshData = useCallback(async () => {
    if (data.profile) {
      await loadStudentWorkspace(data.profile)
    }
  }, [data.profile, loadStudentWorkspace])

  const session = useMemo(() => data.profile, [data.profile])
  const isAdmin = useMemo(() => {
    return (
      data.profile?.role === "admin" ||
      data.profile?.nim?.toUpperCase() === "ADMIN001"
    )
  }, [data.profile])

  const value = useMemo<AppStoreContextType>(
    () => ({
      data,
      session,
      user: session,
      isAdmin,
      hydrated,
      isLoading,
      configured,
      saveStatus,
      enter,
      setProfile,
      saveEntry,
      toggleComplete,
      toggleFavorite,
      isFavorite,
      recordRecent,
      viewTherapy,
      viewDrug,
      resetProgress,
      resetData,
      exportBackup,
      importBackup,
      logout,
      refreshData,
    }),
    [
      data,
      session,
      isAdmin,
      hydrated,
      isLoading,
      configured,
      saveStatus,
      enter,
      setProfile,
      saveEntry,
      toggleComplete,
      toggleFavorite,
      isFavorite,
      recordRecent,
      viewTherapy,
      viewDrug,
      resetProgress,
      resetData,
      exportBackup,
      importBackup,
      logout,
      refreshData,
    ]
  )

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  )
}

export function useAppStore() {
  const context = useContext(AppStoreContext)
  if (!context) {
    throw new Error("useAppStore harus digunakan di dalam AppStoreProvider")
  }
  return context
}
