"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useAppStore } from "@/components/app-store-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Drug, DrugNotes } from "@/lib/types"
import { sanitizeNotes } from "@/lib/storage"
import {
  BookOpen,
  CheckCircle2,
  Info,
  Plus,
  Save,
  Sparkles,
  X,
} from "lucide-react"

export function DrugForm({ drug, therapyId }: { drug: Drug; therapyId: string }) {
  const { data, saveEntry, toggleComplete } = useAppStore()
  const entry = data?.entries?.[drug.id]

  const [notes, setNotes] = useState<DrugNotes>(() => sanitizeNotes(entry?.notes))
  const [isCompleted, setIsCompleted] = useState<boolean>(() => Boolean(entry?.markedComplete))
  const [tagInput, setTagInput] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    const currentEntry = data?.entries?.[drug.id]
    setNotes(sanitizeNotes(currentEntry?.notes))
    setIsCompleted(Boolean(currentEntry?.markedComplete))
  }, [data?.entries, drug.id])

  const handleFieldChange = (field: keyof DrugNotes, value: string) => {
    setNotes((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddTag = () => {
    const cleanTag = tagInput.trim().replace(/^#/, "")
    if (!cleanTag) return
    const currentTags = Array.isArray(notes.tags) ? notes.tags : []
    if (!currentTags.includes(cleanTag)) {
      setNotes((prev) => ({
        ...prev,
        tags: [...currentTags, cleanTag],
      }))
    }
    setTagInput("")
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = Array.isArray(notes.tags) ? notes.tags : []
    setNotes((prev) => ({
      ...prev,
      tags: currentTags.filter((t) => t !== tagToRemove),
    }))
  }

  const handleSave = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    setIsSaving(true)
    try {
      await saveEntry(drug.id, therapyId, notes, isCompleted)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2500)
    } catch (err) {
      console.error("Gagal menyimpan catatan:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleCompleted = async () => {
    const nextState = !isCompleted
    setIsCompleted(nextState)
    await toggleComplete(drug.id, therapyId, nextState)
  }

  const tagsList = Array.isArray(notes.tags) ? notes.tags : []

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Kolom Kiri: Informasi Referensi Obat */}
      <div className="space-y-6 lg:col-span-1">
        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 font-semibold text-slate-900">
            <Info className="size-4 text-emerald-600" />
            <h3>Referensi Klinis</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-semibold text-muted-foreground">Mekanisme Kerja:</span>
              <p className="mt-0.5 text-slate-800 leading-relaxed">
                {drug.mechanism || drug.description || "Tuliskan ringkasan mekanisme kerja obat ini pada logbook Anda."}
              </p>
            </div>

            {drug.dosageForms && (
              <div>
                <span className="font-semibold text-muted-foreground">Bentuk Sediaan:</span>
                <p className="mt-0.5 text-slate-800">
                  {Array.isArray(drug.dosageForms) ? drug.dosageForms.join(", ") : String(drug.dosageForms)}
                </p>
              </div>
            )}

            {drug.indications && (
              <div>
                <span className="font-semibold text-muted-foreground">Indikasi Umum:</span>
                <p className="mt-0.5 text-slate-800">
                  {Array.isArray(drug.indications) ? drug.indications.join("; ") : String(drug.indications)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status Selesai Belajar */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Status Pembelajaran
          </h4>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-medium">
              {isCompleted ? "Sudah dipelajari" : "Belum selesai"}
            </span>
            <Button
              size="sm"
              variant={isCompleted ? "default" : "outline"}
              onClick={handleToggleCompleted}
              className={isCompleted ? "bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" : "gap-1.5"}
            >
              <CheckCircle2 className="size-4" />
              <span>{isCompleted ? "Selesai" : "Tandai Selesai"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Lembar Catatan Logbook */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Catatan Mahasiswa (PKPA)</h2>
          </div>
          <Button
            size="sm"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 text-white"
          >
            <Save className="size-4" />
            <span>{isSaving ? "Menyimpan..." : savedSuccess ? "Tersimpan!" : "Simpan Catatan"}</span>
          </Button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSave}>
          <div className="space-y-1.5">
            <Label htmlFor="note-mechanism">Mekanisme Kerja</Label>
            <Textarea
              id="note-mechanism"
              rows={2}
              value={notes.mechanism || ""}
              onChange={(e) => handleFieldChange("mechanism", e.target.value)}
              placeholder="Contoh: Menghambat enzim COX-1 dan COX-2 sehingga sintesis prostaglandin menurun..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note-indication">Indikasi &amp; Penggunaan Klinis</Label>
            <Textarea
              id="note-indication"
              rows={2}
              value={notes.indication || ""}
              onChange={(e) => handleFieldChange("indication", e.target.value)}
              placeholder="Contoh: Terapi lini pertama untuk hipertensi esensial..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note-dosage">Dosis &amp; Aturan Pakai</Label>
            <Textarea
              id="note-dosage"
              rows={2}
              value={notes.dosage || ""}
              onChange={(e) => handleFieldChange("dosage", e.target.value)}
              placeholder="Contoh: 1x sehari 5 mg pagi hari, dapat ditingkatkan hingga 10 mg..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note-usage">Cara Penggunaan / Aturan Minum</Label>
            <Textarea
              id="note-usage"
              rows={2}
              value={notes.usage || ""}
              onChange={(e) => handleFieldChange("usage", e.target.value)}
              placeholder="Contoh: Diminum sesudah makan untuk meminimalkan iritasi lambung..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="note-sideEffects">Efek Samping Utama &amp; Tanda Bahaya</Label>
              <Textarea
                id="note-sideEffects"
                rows={2}
                value={notes.sideEffects || ""}
                onChange={(e) => handleFieldChange("sideEffects", e.target.value)}
                placeholder="Contoh: Edema perifer, pusing, flushing..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note-contraindications">Kontraindikasi</Label>
              <Textarea
                id="note-contraindications"
                rows={2}
                value={notes.contraindications || ""}
                onChange={(e) => handleFieldChange("contraindications", e.target.value)}
                placeholder="Contoh: Hipotensi berat, syok kardiogenik..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note-interactions">Interaksi Obat Penting</Label>
            <Textarea
              id="note-interactions"
              rows={2}
              value={notes.interactions || ""}
              onChange={(e) => handleFieldChange("interactions", e.target.value)}
              placeholder="Contoh: Simvastatin (batasi dosis maks 20 mg), CYP3A4 inhibitor..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note-patientEducation">Instruksi Khusus &amp; Konseling Pasien</Label>
            <Textarea
              id="note-patientEducation"
              rows={3}
              value={notes.patientEducation || notes.specialInstructions || ""}
              onChange={(e) => {
                handleFieldChange("patientEducation", e.target.value)
                handleFieldChange("specialInstructions", e.target.value)
              }}
              placeholder="Contoh: Edukasi pasien mengenai potensi bengkak di pergelangan kaki, jangan hentikan obat mendadak..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note-brands">Merk Dagang / Sediaan di Apotek</Label>
            <Textarea
              id="note-brands"
              rows={2}
              value={notes.brands || (Array.isArray(notes.brandNames) ? notes.brandNames.join(", ") : String(notes.brandNames || ""))}
              onChange={(e) => handleFieldChange("brands", e.target.value)}
              placeholder="Contoh: Norvask tab 5 mg, 10 mg; Tensivask tab 5 mg..."
            />
          </div>

          {/* Bagian Tag */}
          <div className="space-y-2 pt-2">
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-amber-500" />
              Tag / Kata Kunci Khusus
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              {tagsList.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-lg border bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-slate-400 hover:text-rose-500"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1.5">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  placeholder="Tambah tag..."
                  className="h-8 w-32 text-xs"
                />
                <Button type="button" size="sm" variant="outline" onClick={handleAddTag} className="h-8 px-2">
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
