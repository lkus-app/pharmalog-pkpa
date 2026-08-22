import type { AppData, DrugNotes, DrugWorkspaceEntry, TherapyClass } from "@/lib/types"

export function emptyWorkspace(): AppData {
  return {
    profile: null,
    entries: {},
    favorites: [],
    recent: [],
    lastVisited: undefined,
  }
}

export function getFilledNotesCount(notes?: Partial<DrugNotes> | null): number {
  if (!notes || typeof notes !== "object") return 0
  const fields = [
    notes.indication,
    notes.dosage,
    notes.sideEffects,
    notes.contraindications,
    notes.interactions,
    notes.specialInstructions,
  ]
  return fields.filter((f) => typeof f === "string" && f.trim().length > 0).length
}

export function hasNotesContent(notes?: Partial<DrugNotes> | null): boolean {
  if (!notes || typeof notes !== "object") return false
  const hasFields = getFilledNotesCount(notes) > 0
  const hasTags =
    Array.isArray(notes.tags) &&
    notes.tags.filter((t) => typeof t === "string" && t.trim().length > 0).length > 0
  return hasFields || hasTags
}

export function isDrugCompleted(entry?: DrugWorkspaceEntry | null): boolean {
  if (!entry || typeof entry !== "object") return false
  return Boolean(entry.markedComplete)
}

export function calculateTherapyProgress(
  therapy: TherapyClass,
  entries: Record<string, DrugWorkspaceEntry> = {}
) {
  const drugs = Array.isArray(therapy?.drugs) ? therapy.drugs : []
  if (!drugs.length) return { total: 0, completed: 0, percentage: 0 }

  const completed = drugs.filter((drug) => {
    const entry = entries?.[drug?.id]
    return Boolean(entry?.markedComplete)
  }).length

  return {
    total: drugs.length,
    completed,
    percentage: Math.round((completed / drugs.length) * 100),
  }
}

export function calculateOverallProgress(
  therapies: TherapyClass[] = [],
  entries: Record<string, DrugWorkspaceEntry> = {}
) {
  const list = Array.isArray(therapies) ? therapies : []
  let total = 0
  let completed = 0

  for (const t of list) {
    const drugs = Array.isArray(t?.drugs) ? t.drugs : []
    total += drugs.length
    for (const d of drugs) {
      if (d?.id && entries?.[d.id]?.markedComplete) {
        completed += 1
      }
    }
  }

  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}
