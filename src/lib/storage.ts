import type { AppData, DrugNotes, DrugWorkspaceEntry } from "@/lib/types"

export const DEFAULT_APP_DATA: AppData = {
  profile: null,
  entries: {},
  favorites: [],
  recent: [],
  lastVisited: undefined,
}

export function sanitizeNotes(notes?: Partial<DrugNotes> | null): DrugNotes {
  return {
    indication: String(notes?.indication ?? ""),
    dosage: String(notes?.dosage ?? ""),
    sideEffects: String(notes?.sideEffects ?? ""),
    contraindications: String(notes?.contraindications ?? ""),
    interactions: String(notes?.interactions ?? ""),
    specialInstructions: String(notes?.specialInstructions ?? ""),
    tags: Array.isArray(notes?.tags)
      ? notes.tags.map((t) => String(t ?? "").trim()).filter(Boolean)
      : [],
  }
}

export function normalizeAppData(raw?: any): AppData {
  if (!raw || typeof raw !== "object") return DEFAULT_APP_DATA

  const rawEntries = raw.entries && typeof raw.entries === "object" ? raw.entries : {}
  const normalizedEntries: Record<string, DrugWorkspaceEntry> = {}

  for (const [drugId, entry] of Object.entries(rawEntries)) {
    if (entry && typeof entry === "object") {
      const e = entry as any
      normalizedEntries[drugId] = {
        notes: sanitizeNotes(e.notes),
        markedComplete: Boolean(e.markedComplete),
        updatedAt: typeof e.updatedAt === "string" ? e.updatedAt : new Date().toISOString(),
      }
    }
  }

  const rawFavorites = Array.isArray(raw.favorites) ? raw.favorites : []
  const rawRecent = Array.isArray(raw.recent) ? raw.recent : []

  return {
    profile: raw.profile && typeof raw.profile === "object" ? raw.profile : null,
    entries: normalizedEntries,
    favorites: rawFavorites.filter((id: any) => typeof id === "string" && id.trim().length > 0),
    recent: rawRecent.filter((r: any) => r && typeof r.drugId === "string"),
    lastVisited: typeof raw.lastVisited === "string" ? raw.lastVisited : undefined,
  }
}

export function getOrCreateEntry(data: AppData, drugId: string): DrugWorkspaceEntry {
  const existing = data?.entries?.[drugId]
  if (existing) {
    return {
      notes: sanitizeNotes(existing.notes),
      markedComplete: Boolean(existing.markedComplete),
      updatedAt: existing.updatedAt || new Date().toISOString(),
    }
  }

  return {
    notes: sanitizeNotes(null),
    markedComplete: false,
    updatedAt: new Date().toISOString(),
  }
}

export function downloadJson(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
