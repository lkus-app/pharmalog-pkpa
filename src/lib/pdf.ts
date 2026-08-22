import { ALL_DRUGS, THERAPY_GROUPS, getTherapyById } from "@/lib/catalog"
import { APP_NAME, APP_SUBTITLE, DRUG_FIELDS, EMPTY_NOTES, MEDICAL_DISCLAIMER } from "@/lib/constants"
import { getDrugProgress, getOverallProgress, getTherapyProgress } from "@/lib/progress"
import type { AppData, DrugNotes } from "@/lib/types"
import { formatDateId, isBlank, sanitizeFilename } from "@/lib/utils"

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function multiline(value?: string | string[]): string {
  if (!value) return "<em>Belum diisi</em>"
  const text = Array.isArray(value) ? value.join(", ") : String(value)
  const trimmed = text.trim()
  if (!trimmed) return "<em>Belum diisi</em>"
  return escapeHtml(trimmed).replace(/\n/g, "<br />")
}

function notesBlock(notes: DrugNotes): string {
  return DRUG_FIELDS.map(
    (field) => `
      <div class="field">
        <div class="field-label">${escapeHtml(field.label)}</div>
        <div class="field-value">${multiline(notes[field.key as keyof DrugNotes])}</div>
      </div>
    `
  ).join("")
}

export function buildPortfolioHtml(data: AppData): HTMLElement {
  const overall = getOverallProgress(data.entries)
  const studentName = data.profile?.name?.trim() || "Mahasiswa PKPA"
  const nim = data.profile?.nim || "—"
  const pharmacy = data.profile?.pharmacyName || data.profile?.pharmacy || "—"
  const preceptor = data.profile?.preceptorName || data.profile?.preceptor || "—"
  const period = data.profile?.period || "—"
  const generated = formatDateId(new Date())

  const therapySections = THERAPY_GROUPS.map((group) => {
    const progress = getTherapyProgress(group.id, data.entries)
    const drugHtml = group.drugs
      .map((drug) => {
        const entry = data.entries[drug.id]
        const notes = entry?.notes ?? EMPTY_NOTES
        const drugProgress = getDrugProgress(entry)
        const hasContent =
          drugProgress.filled > 0 ||
          drugProgress.markedComplete ||
          DRUG_FIELDS.some((field) => !isBlank(notes[field.key as keyof DrugNotes]))

        if (!hasContent) {
          return `
            <div class="drug compact pdf-keep">
              <div class="drug-title">${escapeHtml(drug.name)} <span class="muted">· Belum dicatat</span></div>
            </div>
          `
        }

        return `
          <div class="drug pdf-keep">
            <div class="drug-head">
              <div class="drug-title">${escapeHtml(drug.name)}</div>
              <div class="muted">${drugProgress.filled}/7 field · ${drugProgress.percent}%</div>
            </div>
            ${notesBlock(notes)}
          </div>
        `
      })
      .join("")

    return `
      <section class="group pdf-break-before">
        <h2>${escapeHtml(group.name)}</h2>
        <p class="muted">${progress.completedDrugs}/${progress.drugCount} obat selesai · progress ${progress.percent}%</p>
        ${drugHtml}
      </section>
    `
  }).join("")

  const wrapper = document.createElement("div")
  wrapper.innerHTML = `
    <div class="pdf-root">
      <style>
        .pdf-root { font-family: "Segoe UI", Arial, sans-serif; color: #123; width: 720px; }
        .cover { background: #0f2c59; color: #fff; padding: 36px 32px; border-radius: 12px; }
        .cover h1 { margin: 8px 0 4px; font-size: 28px; }
        .cover .sub { opacity: .85; font-size: 13px; margin-bottom: 24px; }
        .meta { width: 100%; border-collapse: collapse; background: rgba(255,255,255,.08); }
        .meta th, .meta td { text-align: left; padding: 8px 10px; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,.1); }
        .meta th { width: 34%; opacity: .8; font-weight: 600; }
        .stats { display: flex; gap: 12px; margin: 18px 0 0; }
        .stat { flex: 1; background: rgba(255,255,255,.1); border-radius: 8px; padding: 10px; }
        .stat b { display: block; font-size: 18px; }
        .stat span { font-size: 11px; opacity: .85; }
        h2 { color: #0f2c59; font-size: 18px; margin: 28px 0 6px; border-bottom: 2px solid #10b981; padding-bottom: 6px; }
        .group { page-break-before: always; }
        .group:first-of-type { page-break-before: auto; }
        .drug { border: 1px solid #dbe4f0; border-radius: 10px; padding: 12px; margin: 10px 0; page-break-inside: avoid; }
        .drug.compact { padding: 8px 12px; background: #f8fafc; }
        .drug-head { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
        .drug-title { font-weight: 700; color: #0f2c59; }
        .field { margin: 8px 0; }
        .field-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #1d4ed8; margin-bottom: 2px; }
        .field-value { font-size: 12px; line-height: 1.45; }
        .muted { color: #64748b; font-size: 12px; }
        .disclaimer { margin-top: 28px; padding: 16px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px; page-break-inside: avoid; }
        .disclaimer h3 { margin: 0 0 8px; color: #92400e; font-size: 14px; }
        .disclaimer p { margin: 0; font-size: 11px; line-height: 1.5; color: #78350f; }
        em { color: #94a3b8; }
      </style>

      <section class="cover">
        <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#6ee7b7;">Portofolio Pembelajaran</div>
        <h1>${escapeHtml(APP_NAME)}</h1>
        <div class="sub">${escapeHtml(APP_SUBTITLE)}</div>

        <table class="meta">
          <tr><th>Nama mahasiswa</th><td>${escapeHtml(studentName)}</td></tr>
          <tr><th>NIM</th><td>${escapeHtml(nim)}</td></tr>
          <tr><th>Apotek</th><td>${escapeHtml(pharmacy)}</td></tr>
          <tr><th>Preseptor</th><td>${escapeHtml(preceptor)}</td></tr>
          <tr><th>Periode</th><td>${escapeHtml(period)}</td></tr>
          <tr><th>Tanggal unduh</th><td>${escapeHtml(generated)}</td></tr>
        </table>

        <div class="stats">
          <div class="stat"><b>${overall.percent}%</b><span>Progress keseluruhan</span></div>
          <div class="stat"><b>${overall.completedDrugs}/${ALL_DRUGS.length}</b><span>Obat selesai</span></div>
          <div class="stat"><b>${overall.completedTherapies}/${THERAPY_GROUPS.length}</b><span>Kelompok selesai</span></div>
        </div>
      </section>

      ${therapySections}

      <section class="disclaimer">
        <h3>Disclaimer medis</h3>
        <p>${escapeHtml(MEDICAL_DISCLAIMER)}</p>
      </section>
    </div>
  `

  const root = wrapper.firstElementChild
  if (!(root instanceof HTMLElement)) {
    throw new Error("Failed to build portfolio HTML")
  }
  return root
}

export async function exportPortfolioPdf(data: AppData): Promise<void> {
  if (typeof window === "undefined") return
  const html2pdfModule = await import("html2pdf.js")
  const html2pdf = (html2pdfModule as any).default || html2pdfModule
  const source = buildPortfolioHtml(data)
  source.style.position = "fixed"
  source.style.left = "-10000px"
  source.style.top = "0"
  source.style.background = "#ffffff"
  document.body.appendChild(source)

  const rawName = data.profile?.name || "Mahasiswa_PKPA"
  const filename = `PharmaLog_PKPA_${sanitizeFilename(rawName)}.pdf`

  try {
    await html2pdf()
      .set({
        margin: [10, 10, 12, 10],
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(source)
      .save()
  } finally {
    source.remove()
  }
}

export function getPortfolioPreviewModel(data: AppData) {
  const overall = getOverallProgress(data.entries)
  const notedDrugs = ALL_DRUGS.filter((drug) => getDrugProgress(data.entries[drug.id]).filled > 0)
  return {
    overall,
    studentName: data.profile?.name?.trim() || "Mahasiswa PKPA",
    notedCount: notedDrugs.length,
    sample: notedDrugs.slice(0, 6).map((drug) => ({
      drug,
      therapyName: getTherapyById(drug.therapyId || "")?.name ?? "",
      progress: getDrugProgress(data.entries[drug.id]),
    })),
  }
}
