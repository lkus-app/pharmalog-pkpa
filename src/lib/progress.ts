import { ALL_DRUGS, THERAPY_GROUPS, getTherapyById } from "@/lib/catalog"
import { TOTAL_FIELDS } from "@/lib/constants"
import type {
  AppData,
  DrugEntry,
  DrugNotes,
  DrugProgress,
  LearningStatus,
  OverallProgress,
  TherapyProgress,
} from "@/lib/types"
import { clampPercent, isBlank } from "@/lib/utils"

const TRACKED_FIELDS: Array<keyof DrugNotes> = [
  "mechanism",
  "indication",
  "dosage",
  "usage",
  "sideEffects",
  "patientEducation",
  "brands",
]

export function countFilledFields(notes: DrugNotes | undefined): number {
  if (!notes) return 0
  return TRACKED_FIELDS.filter((key) => {
    const val = notes[key]
    if (typeof val === "string") return !isBlank(val)
    if (Array.isArray(val)) return val.length > 0
    return Boolean(val)
  }).length
}

export function resolveStatus(filled: number, markedComplete: boolean): LearningStatus {
  if (markedComplete || filled === TOTAL_FIELDS) return "completed"
  if (filled === 0) return "not-started"
  return "in-progress"
}

export function getDrugProgress(entry: DrugEntry | undefined): DrugProgress {
  const filled = countFilledFields(entry?.notes)
  const markedComplete = Boolean(entry?.markedComplete)
  return {
    filled,
    total: TOTAL_FIELDS,
    percent: clampPercent((filled / TOTAL_FIELDS) * 100),
    status: resolveStatus(filled, markedComplete),
    markedComplete,
  }
}

export function getTherapyProgress(
  therapyId: string,
  entries: AppData["entries"] = {}
): TherapyProgress {
  const therapy = getTherapyById(therapyId)
  const drugs = therapy?.drugs ?? []
  const progresses = drugs.map((drug) => getDrugProgress(entries[drug.id]))
  const completedDrugs = progresses.filter((item) => item.status === "completed").length
  const inProgressDrugs = progresses.filter((item) => item.status === "in-progress").length
  const notStartedDrugs = progresses.filter((item) => item.status === "not-started").length
  const filledFields = progresses.reduce((sum, item) => sum + item.filled, 0)
  const totalFields = drugs.length * TOTAL_FIELDS
  const percent = clampPercent(totalFields === 0 ? 0 : (filledFields / totalFields) * 100)

  let status: LearningStatus = "not-started"
  if (drugs.length > 0 && completedDrugs === drugs.length) status = "completed"
  else if (completedDrugs > 0 || inProgressDrugs > 0) status = "in-progress"

  return {
    therapyId,
    drugCount: drugs.length,
    filledFields,
    totalFields,
    completedDrugs,
    inProgressDrugs,
    notStartedDrugs,
    percent,
    status,
  }
}

export function getOverallProgress(entries: AppData["entries"] = {}): OverallProgress {
  const therapySummaries = THERAPY_GROUPS.map((group) =>
    getTherapyProgress(group.id, entries)
  )
  const filledFields = therapySummaries.reduce((sum, item) => sum + item.filledFields, 0)
  const totalFields = ALL_DRUGS.length * TOTAL_FIELDS
  const completedDrugs = therapySummaries.reduce((sum, item) => sum + item.completedDrugs, 0)
  const inProgressDrugs = therapySummaries.reduce(
    (sum, item) => sum + item.inProgressDrugs,
    0
  )
  const notStartedDrugs = therapySummaries.reduce(
    (sum, item) => sum + item.notStartedDrugs,
    0
  )

  return {
    therapyCount: THERAPY_GROUPS.length,
    drugCount: ALL_DRUGS.length,
    completedDrugs,
    inProgressDrugs,
    notStartedDrugs,
    filledFields,
    totalFields,
    percent: clampPercent(totalFields === 0 ? 0 : (filledFields / totalFields) * 100),
    completedTherapies: therapySummaries.filter((item) => item.status === "completed").length,
  }
}

export function compareBySort<T extends { name: string; percent: number }>(
  a: T,
  b: T,
  sort: "name-asc" | "name-desc" | "progress-desc" | "progress-asc"
) {
  switch (sort) {
    case "name-desc":
      return b.name.localeCompare(a.name, "id")
    case "progress-desc":
      return b.percent - a.percent || a.name.localeCompare(b.name, "id")
    case "progress-asc":
      return a.percent - b.percent || a.name.localeCompare(b.name, "id")
    default:
      return a.name.localeCompare(b.name, "id")
  }
}

export function findContinueTarget(data: AppData) {
  if (data.lastVisited?.path) return data.lastVisited
  const entries = data.entries || {}

  for (const group of THERAPY_GROUPS) {
    for (const drug of group.drugs) {
      const progress = getDrugProgress(entries[drug.id])
      if (progress.status === "in-progress") {
        return {
          therapyId: group.id,
          drugId: drug.id,
          path: `/learning/${group.id}/${drug.id}`,
          label: `${drug.name} · ${group.name}`,
        }
      }
    }
  }

  for (const group of THERAPY_GROUPS) {
    for (const drug of group.drugs) {
      const progress = getDrugProgress(entries[drug.id])
      if (progress.status === "not-started") {
        return {
          therapyId: group.id,
          drugId: drug.id,
          path: `/learning/${group.id}/${drug.id}`,
          label: `${drug.name} · ${group.name}`,
        }
      }
    }
  }

  return {
    therapyId: THERAPY_GROUPS[0]?.id ?? "analgetika-non-narkotika",
    path: "/learning",
    label: "Materi pembelajaran PKPA",
  }
}
