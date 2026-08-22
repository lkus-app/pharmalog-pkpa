import { THERAPY_GROUPS, ALL_DRUGS, getTherapyById as getCatalogTherapy, getDrugById as getCatalogDrug } from "@/lib/catalog"
import type { Drug, TherapyClass } from "@/lib/types"

export const THERAPIES: TherapyClass[] = THERAPY_GROUPS

export function getAllDrugs(): Drug[] {
  return ALL_DRUGS
}

export function getDrugById(id: string): Drug | undefined {
  const cleanId = (id || "").toLowerCase().trim()
  return getCatalogDrug(cleanId) || ALL_DRUGS.find((d) => d.id.toLowerCase() === cleanId || d.name.toLowerCase() === cleanId)
}

export function getTherapyById(id: string): TherapyClass | undefined {
  const cleanId = (id || "").toLowerCase().trim()
  return getCatalogTherapy(cleanId) || THERAPIES.find((t) => t.id.toLowerCase() === cleanId || t.name.toLowerCase() === cleanId)
}
