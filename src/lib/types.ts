export type UserRole = "student" | "admin"

export type LearningStatus = "not-started" | "in-progress" | "completed"

export type StatusFilter = "all" | "completed" | "in-progress" | "not-started"

export type SortKey = "name-asc" | "name-desc" | "progress-desc" | "progress-asc"

export type SaveStatus = "idle" | "saving" | "saved" | "error"

export type TherapyIconName =
  | "pill"
  | "bone"
  | "bug"
  | "shield"
  | "virus"
  | "brain"
  | "activity"
  | "droplets"
  | "smile"
  | "mic"
  | "syringe"
  | "heart"
  | "flame"
  | "wind"
  | "heart-pulse"
  | "waves"
  | "sparkles"
  | "glass-water"
  | "eye"
  | "zap"
  | "apple"
  | "air-vent"
  | "leaf"

export interface DrugNotes {
  mechanism?: string
  indication?: string
  dosage?: string
  dose?: string
  usage?: string
  administration?: string
  sideEffects?: string
  contraindications?: string
  interactions?: string
  specialInstructions?: string
  patientEducation?: string
  education?: string
  brands?: string
  brandNames?: string | string[]
  tags?: string[]
  [key: string]: any
}

export interface DrugFieldMeta {
  key: keyof DrugNotes
  label: string
  hint: string
  placeholder: string
}

export interface DrugWorkspaceEntry {
  notes: DrugNotes
  markedComplete: boolean
  updatedAt: string
}

export type DrugEntry = DrugWorkspaceEntry

export interface Drug {
  id: string
  name: string
  therapyId?: string
  genericName?: string
  brandNames?: string[] | string
  category?: string
  drugClass?: string
  dosageForms?: string[] | string
  indications?: string[] | string
  mechanism?: string
  description?: string
  [key: string]: any
}

export interface TherapyClass {
  id: string
  name: string
  description?: string
  icon?: TherapyIconName
  drugs: Drug[]
}

export type TherapyGroup = TherapyClass

export interface StudentProfile {
  id: string
  name: string
  nim: string
  pharmacy?: string
  pharmacyName?: string
  preceptor?: string
  preceptorName?: string
  period?: string
  role?: UserRole
  [key: string]: any
}

export interface AppData {
  profile: StudentProfile | null
  entries: Record<string, DrugWorkspaceEntry>
  favorites: string[]
  recent: Array<{ drugId: string; therapyId: string; viewedAt: string }>
  lastVisited?: {
    therapyId: string
    drugId?: string
    path: string
    label: string
  }
}

export interface DrugProgress {
  filled: number
  total: number
  percent: number
  status: LearningStatus
  markedComplete: boolean
}

export interface TherapyProgress {
  therapyId: string
  drugCount: number
  filledFields: number
  totalFields: number
  completedDrugs: number
  inProgressDrugs: number
  notStartedDrugs: number
  percent: number
  status: LearningStatus
}

export interface OverallProgress {
  therapyCount: number
  drugCount: number
  completedDrugs: number
  inProgressDrugs: number
  notStartedDrugs: number
  filledFields: number
  totalFields: number
  percent: number
  completedTherapies: number
}
