import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { THERAPIES, getAllDrugs } from "@/lib/therapies"
import { hasNotesContent } from "@/lib/mappers"
import type { StudentProfile, DrugNotes, DrugWorkspaceEntry } from "@/lib/types"

export interface StudentReportData {
  profile: StudentProfile
  entries: Record<string, DrugWorkspaceEntry>
  completedDrugsCount?: number
  filledNotesCount?: number
  lastUpdated?: string
}

export function formatStudentFilename(profile?: StudentProfile | null, extension: "pdf" | "json" = "pdf"): string {
  const name = (profile?.name?.trim() || "Mahasiswa").replace(/[/\\?%*:|"<>]/g, "_").replace(/\s+/g, "_")
  const nim = (profile?.nim?.trim() || "NIM").replace(/[/\\?%*:|"<>]/g, "_").replace(/\s+/g, "_")
  return `${name}_${nim}.${extension}`
}

function safeText(str?: any): string {
  if (!str || typeof str !== "string" || str.trim() === "") return "-"
  return str.trim()
}

/**
 * Membangun dokumen PDF untuk satu mahasiswa menggunakan jsPDF & jspdf-autotable (Direct Vector PDF)
 * Menjamin 100% TIDAK PERNAH BLANK PUTIH karena tidak menggunakan screenshot kanvas.
 */
export function buildStudentPdfDocument(doc: jsPDF, student: StudentReportData, isNewDocument = true): void {
  const { profile, entries = {} } = student
  const allDrugs = getAllDrugs()
  const totalDrugs = allDrugs.length

  let completedCount = 0
  let filledNotesCount = 0

  const therapyData: Array<{
    name: string
    total: number
    completed: number
    filled: number
    drugs: Array<{
      id: string
      name: string
      notes: DrugNotes
      isCompleted: boolean
      hasNotes: boolean
    }>
  }> = []

  for (const therapy of THERAPIES) {
    let tComp = 0
    let tFill = 0
    const dList = []

    for (const drug of therapy.drugs) {
      const entry = entries[drug.id]
      const notes = entry?.notes || {
        indication: "",
        dosage: "",
        sideEffects: "",
        contraindications: "",
        interactions: "",
        specialInstructions: "",
      }
      const isCompleted = Boolean(entry?.markedComplete)
      const hasNotes = hasNotesContent(notes)

      if (isCompleted) {
        completedCount++
        tComp++
      }
      if (hasNotes) {
        filledNotesCount++
        tFill++
      }

      dList.push({
        id: drug.id,
        name: drug.name,
        notes,
        isCompleted,
        hasNotes,
      })
    }

    therapyData.push({
      name: therapy.name,
      total: therapy.drugs.length,
      completed: tComp,
      filled: tFill,
      drugs: dList,
    })
  }

  const completionPct = totalDrugs > 0 ? Math.round((completedCount / totalDrugs) * 100) : 0

  // 1. Header Resmi PKPA
  doc.setFillColor(5, 150, 105) // Emerald 600
  doc.rect(14, 12, 182, 2.5, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.setTextColor(6, 95, 70) // Emerald 800
  doc.text("LEMBAR KERJA & LOGBOOK KLINIS PKPA APOTEKER", 14, 21)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.setTextColor(71, 85, 105) // Slate 600
  doc.text("Sistem E-Logbook & Portofolio Farmasi Klinis • PharmaLog PKPA", 14, 26)

  const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text(`Dicetak: ${dateStr}`, 196, 26, { align: "right" })

  // 2. Tabel Identitas Mahasiswa
  autoTable(doc, {
    startY: 30,
    head: [
      [
        {
          content: "IDENTITAS MAHASISWA PRAKTIKAN & EVALUASI PKPA",
          colSpan: 4,
          styles: { halign: "left", fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: "bold", fontSize: 8.5 },
        },
      ],
    ],
    body: [
      [
        { content: "Nama Mahasiswa", styles: { fontStyle: "bold", textColor: [51, 65, 85] } },
        { content: `: ${safeText(profile.name)}`, styles: { fontStyle: "bold", textColor: [15, 23, 42] } },
        { content: "Wahana / Apotek", styles: { fontStyle: "bold", textColor: [51, 65, 85] } },
        { content: `: ${safeText(profile.pharmacyName)}` },
      ],
      [
        { content: "NIM", styles: { fontStyle: "bold", textColor: [51, 65, 85] } },
        { content: `: ${safeText(profile.nim)}` },
        { content: "Apoteker Preceptor", styles: { fontStyle: "bold", textColor: [51, 65, 85] } },
        { content: `: ${safeText(profile.preceptorName)}` },
      ],
      [
        { content: "Capaian Belajar", styles: { fontStyle: "bold", textColor: [51, 65, 85] } },
        { content: `: ${completedCount} / ${totalDrugs} Obat (${completionPct}%)`, styles: { fontStyle: "bold", textColor: [5, 150, 105] } },
        { content: "Periode PKPA", styles: { fontStyle: "bold", textColor: [51, 65, 85] } },
        { content: `: ${safeText(profile.period)}` },
      ],
    ],
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 60 },
      2: { cellWidth: 35 },
      3: { cellWidth: 55 },
    },
  })

  // 3. Tabel Rekapitulasi 23 Kelas Terapi
  const currentYAfterProfile = (doc as any).lastAutoTable.finalY + 6

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9.5)
  doc.setTextColor(15, 23, 42)
  doc.text("I. REKAPITULASI CAPAIAN 23 KELAS TERAPI", 14, currentYAfterProfile)

  const therapyRows = therapyData.map((t, idx) => {
    const isDone = t.completed === t.total && t.total > 0
    return [
      idx + 1,
      t.name,
      `${t.total} Obat`,
      `${t.filled} / ${t.total} Terisi`,
      isDone ? "Lengkap Selesai" : `${t.completed}/${t.total} Selesai`,
    ]
  })

  autoTable(doc, {
    startY: currentYAfterProfile + 2.5,
    head: [["No", "Kelas Terapi", "Total Obat", "Catatan Terisi", "Status Capaian"]],
    body: therapyRows,
    theme: "grid",
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
      cellPadding: 2,
    },
    styles: {
      fontSize: 7.2,
      cellPadding: 1.8,
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 80, fontStyle: "bold" },
      2: { cellWidth: 26, halign: "center" },
      3: { cellWidth: 32, halign: "center" },
      4: { cellWidth: 34, halign: "center" },
    },
  })

  // 4. Lembar Kerja Parameter Klinis Obat (Hasil Inputan Mahasiswa)
  const currentYAfterTherapies = (doc as any).lastAutoTable.finalY + 8

  // Cek apakah muat di halaman 1 atau perlu halaman baru
  if (currentYAfterTherapies > 240) {
    doc.addPage()
  }

  const pageCountSoFar = doc.getNumberOfPages()
  const startYForDrugs = currentYAfterTherapies <= 240 ? currentYAfterTherapies : 16

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9.5)
  doc.setTextColor(15, 23, 42)
  doc.text("II. LEMBAR KERJA PARAMETER KLINIS OBAT (CATATAN MAHASISWA)", 14, startYForDrugs)

  // Kumpulkan seluruh obat
  const drugRows: any[] = []
  let drugCounter = 1

  for (const t of therapyData) {
    for (const d of t.drugs) {
      const n = d.notes
      const formattedNotes = [
        `1. Indikasi: ${safeText(n.indication)}`,
        `2. Dosis Lazim: ${safeText(n.dosage)}`,
        `3. Aturan Pakai: ${safeText(n.specialInstructions)}`,
        `4. Efek Samping: ${safeText(n.sideEffects)}`,
        `5. Kontraindikasi: ${safeText(n.contraindications)}`,
        `6. Interaksi: ${safeText(n.interactions)}`,
      ].join("\n")

      drugRows.push([
        drugCounter++,
        `${d.name}\n(${t.name})`,
        formattedNotes,
        d.isCompleted ? "✓ Selesai" : d.hasNotes ? "Sedang Diisi" : "Belum Diisi",
      ])
    }
  }

  autoTable(doc, {
    startY: startYForDrugs + 3,
    head: [["No", "Nama Obat & Kelas Terapi", "Parameter Klinis (Catatan Mahasiswa)", "Status"]],
    body: drugRows,
    theme: "grid",
    headStyles: {
      fillColor: [15, 23, 42], // Slate 900
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      cellPadding: 2.5,
    },
    styles: {
      fontSize: 7.2,
      cellPadding: 2.5,
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
      textColor: [30, 41, 59],
      valign: "top",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 42, fontStyle: "bold", textColor: [6, 95, 70] },
      2: { cellWidth: 106, textColor: [15, 23, 42] },
      3: { cellWidth: 24, halign: "center", fontStyle: "bold" },
    },
    didParseCell: (data: any) => {
      if (data.section === "body" && data.column.index === 3) {
        if (data.cell.raw === "✓ Selesai") {
          data.cell.styles.textColor = [5, 150, 105]
        } else if (data.cell.raw === "Sedang Diisi") {
          data.cell.styles.textColor = [2, 132, 199]
        } else {
          data.cell.styles.textColor = [148, 163, 184]
        }
      }
    },
  })

  // 5. Lembar Pengesahan Tanda Tangan
  const finalTableY = (doc as any).lastAutoTable.finalY + 6
  if (finalTableY > 230) {
    doc.addPage()
  }

  const signatureY = finalTableY <= 230 ? finalTableY + 4 : 20

  autoTable(doc, {
    startY: signatureY,
    body: [
      [
        {
          content: `Mahasiswa Praktikan,\n\n\n\n\n( ${safeText(profile.name)} )\nNIM: ${safeText(profile.nim)}`,
          styles: { halign: "center", fontStyle: "bold" },
        },
        {
          content: `Apoteker Preceptor / Pembimbing,\n\n\n\n\n( ${safeText(profile.preceptorName)} )\nSIPAP / STRA: .......................................`,
          styles: { halign: "center", fontStyle: "bold" },
        },
      ],
    ],
    theme: "plain",
    styles: {
      fontSize: 8.5,
      textColor: [15, 23, 42],
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 91 },
      1: { cellWidth: 91 },
    },
  })
}

/**
 * Menambahkan nomor halaman di bagian bawah setiap halaman PDF
 */
function addPageFooters(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7.5)
    doc.setTextColor(148, 163, 184)
    doc.text(`PharmaLog PKPA • E-Logbook & Portofolio Farmasi Klinis`, 14, 290)
    doc.text(`Halaman ${i} dari ${pageCount}`, 196, 290, { align: "right" })
  }
}

/**
 * Generate PDF Mahasiswa Tunggal (Digunakan oleh Mahasiswa & Admin)
 * Nama berkas default: Nama_NIM.pdf
 */
export async function generateStudentPdf(
  student: StudentReportData,
  customFilename?: string
): Promise<void> {
  const filename = customFilename || formatStudentFilename(student.profile, "pdf")

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  buildStudentPdfDocument(doc, student, true)
  addPageFooters(doc)

  doc.save(filename)
}

/**
 * Generate PDF Seluruh Mahasiswa (Digunakan oleh Admin untuk Semua Rekap)
 */
export async function generateAllStudentsPdf(
  students: StudentReportData[],
  customFilename?: string
): Promise<void> {
  if (!students || students.length === 0) {
    throw new Error("Tidak ada data mahasiswa untuk dicetak.")
  }

  const filename = customFilename || `Rekapitulasi_PKPA_Semua_Mahasiswa_${new Date().toISOString().slice(0, 10)}.pdf`

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Halaman 1: Cover & Daftar Rekap Seluruh Mahasiswa
  doc.setFillColor(5, 150, 105)
  doc.rect(14, 14, 182, 3, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(6, 95, 70)
  doc.text("LAPORAN REKAPITULASI HASIL INPUTAN PKPA APOTEKER", 14, 24)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  doc.text("Kompilasi Seluruh Lembar Kerja & Portofolio Klinis Mahasiswa PKPA Farmasi", 14, 30)

  const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text(`Tanggal Cetak: ${dateStr} • Total Mahasiswa: ${students.length} Orang`, 14, 35)

  const allDrugsCount = getAllDrugs().length

  const allSummaryRows = students.map((s, idx) => {
    const completed = Object.values(s.entries || {}).filter((e) => e?.markedComplete).length
    const filled = Object.values(s.entries || {}).filter((e) => hasNotesContent(e?.notes)).length
    return [
      idx + 1,
      safeText(s.profile.name),
      safeText(s.profile.nim),
      safeText(s.profile.pharmacyName),
      safeText(s.profile.preceptorName),
      `${completed} / ${allDrugsCount}`,
      `${filled} Obat`,
    ]
  })

  autoTable(doc, {
    startY: 40,
    head: [["No", "Nama Mahasiswa", "NIM", "Wahana PKPA", "Preceptor", "Obat Selesai", "Catatan Terisi"]],
    body: allSummaryRows,
    theme: "grid",
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      cellPadding: 2.5,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 40, fontStyle: "bold" },
      2: { cellWidth: 24 },
      3: { cellWidth: 35 },
      4: { cellWidth: 35 },
      5: { cellWidth: 20, halign: "center", fontStyle: "bold", textColor: [5, 150, 105] },
      6: { cellWidth: 20, halign: "center", fontStyle: "bold", textColor: [2, 132, 199] },
    },
  })

  // Lampiran Detail Setiap Mahasiswa
  for (let i = 0; i < students.length; i++) {
    doc.addPage()
    buildStudentPdfDocument(doc, students[i], false)
  }

  addPageFooters(doc)
  doc.save(filename)
}

/**
 * Fungsi Cetak Browser (Print Dialog) yang 100% Bersih & Tidak Blank
 * Menggunakan iframe terisolasi dengan HTML tabel standar murni.
 */
export function printStudentReport(student: StudentReportData): void {
  const { profile, entries = {} } = student
  const allDrugs = getAllDrugs()
  const totalDrugs = allDrugs.length

  let completedCount = 0
  let filledNotesCount = 0

  const drugItems = allDrugs.map((d) => {
    const entry = entries[d.id]
    const notes = entry?.notes || {}
    const isCompleted = Boolean(entry?.markedComplete)
    const hasNotes = hasNotesContent(notes)

    if (isCompleted) completedCount++
    if (hasNotes) filledNotesCount++

    const therapy = THERAPIES.find((t) => t.drugs.some((td) => td.id === d.id))

    return {
      drug: d,
      therapyName: therapy?.name || "Kelas Terapi",
      notes,
      isCompleted,
      hasNotes,
    }
  })

  const completionPct = totalDrugs > 0 ? Math.round((completedCount / totalDrugs) * 100) : 0
  const title = formatStudentFilename(profile, "pdf").replace(/\.pdf$/i, "")

  const printHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 12mm 15mm 12mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 11px;
            line-height: 1.4;
          }
          .header-bar {
            border-bottom: 3px solid #059669;
            padding-bottom: 10px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          h1 {
            font-size: 14px;
            font-weight: 800;
            color: #065f46;
            margin: 0 0 4px 0;
            text-transform: uppercase;
          }
          .sub {
            font-size: 10px;
            color: #475569;
            margin: 0;
          }
          .profile-box {
            border: 1px solid #cbd5e1;
            background: #f8fafc;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 18px;
          }
          table.id-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10.5px;
          }
          table.id-table td {
            padding: 2px 4px;
          }
          .section-title {
            font-size: 11px;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            border-bottom: 1.5px solid #059669;
            padding-bottom: 4px;
            margin: 16px 0 10px 0;
          }
          table.data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5px;
            margin-bottom: 16px;
          }
          table.data-table th, table.data-table td {
            border: 1px solid #cbd5e1;
            padding: 5px 7px;
            text-align: left;
            vertical-align: top;
          }
          table.data-table th {
            background-color: #059669;
            color: #ffffff;
            font-weight: 700;
          }
          table.data-table tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .drug-card {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 8px 10px;
            margin-bottom: 10px;
            background: #ffffff;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .drug-header {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
            margin-bottom: 6px;
            font-weight: 700;
          }
          .param-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px 12px;
            font-size: 9.5px;
          }
          .param-label {
            font-weight: 700;
            color: #334155;
          }
          .signature-box {
            margin-top: 30px;
            padding-top: 10px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .sign-col {
            width: 45%;
            text-align: center;
          }
          .sign-line {
            margin-top: 55px;
            font-weight: 700;
            text-decoration: underline;
          }
          @media print {
            .page-break {
              page-break-before: always;
              break-before: page;
            }
          }
        </style>
      </head>
      <body>
        <div class="header-bar">
          <div>
            <h1>LEMBAR KERJA &amp; LOGBOOK KLINIS PKPA APOTEKER</h1>
            <p class="sub">Sistem Informasi Logbook Farmasi Klinis &bull; PharmaLog PKPA</p>
          </div>
          <div style="text-align: right; font-size: 9px; color: #64748b;">
            Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        <div class="profile-box">
          <table class="id-table">
            <tr>
              <td style="width: 20%; font-weight: 700; color: #475569;">Nama Mahasiswa</td>
              <td style="width: 30%; font-weight: 700; color: #0f172a;">: ${safeText(profile.name)}</td>
              <td style="width: 22%; font-weight: 700; color: #475569;">Wahana / Apotek</td>
              <td style="width: 28%; color: #0f172a;">: ${safeText(profile.pharmacyName)}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #475569;">NIM</td>
              <td style="color: #0f172a;">: ${safeText(profile.nim)}</td>
              <td style="font-weight: 700; color: #475569;">Apoteker Preceptor</td>
              <td style="color: #0f172a;">: ${safeText(profile.preceptorName)}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #475569;">Capaian Belajar</td>
              <td style="color: #059669; font-weight: 700;">: ${completedCount} / ${totalDrugs} Obat (${completionPct}%)</td>
              <td style="font-weight: 700; color: #475569;">Periode PKPA</td>
              <td style="color: #0f172a;">: ${safeText(profile.period)}</td>
            </tr>
          </table>
        </div>

        <div class="section-title">LEMBAR KERJA PARAMETER KLINIS OBAT (CATATAN INPUTAN MAHASISWA)</div>

        <div>
          ${drugItems.map((item, idx) => `
            <div class="drug-card">
              <div class="drug-header">
                <span style="color: #065f46; font-size: 11px;">${idx + 1}. ${safeText(item.drug.name)} <span style="font-weight: 400; font-size: 9.5px; color: #64748b;">(${item.therapyName})</span></span>
                <span style="font-size: 9px; font-weight: 700; color: ${item.isCompleted ? '#059669' : item.hasNotes ? '#0284c7' : '#94a3b8'};">
                  ${item.isCompleted ? '✓ Selesai' : item.hasNotes ? 'Sedang Diisi' : 'Belum Diisi'}
                </span>
              </div>
              <div class="param-grid">
                <div><span class="param-label">1. Indikasi:</span> ${safeText(item.notes.indication)}</div>
                <div><span class="param-label">2. Dosis Lazim:</span> ${safeText(item.notes.dosage)}</div>
                <div><span class="param-label">3. Aturan Pakai:</span> ${safeText(item.notes.specialInstructions)}</div>
                <div><span class="param-label">4. Efek Samping:</span> ${safeText(item.notes.sideEffects)}</div>
                <div><span class="param-label">5. Kontraindikasi:</span> ${safeText(item.notes.contraindications)}</div>
                <div><span class="param-label">6. Interaksi:</span> ${safeText(item.notes.interactions)}</div>
              </div>
            </div>
          `).join("")}
        </div>

        <div class="signature-box">
          <div class="sign-col">
            <div>Mahasiswa Praktikan,</div>
            <div class="sign-line">${safeText(profile.name)}</div>
            <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">NIM: ${safeText(profile.nim)}</div>
          </div>
          <div class="sign-col">
            <div>Apoteker Preceptor / Pembimbing,</div>
            <div class="sign-line">${safeText(profile.preceptorName)}</div>
            <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">SIPAP / STRA: .......................................</div>
          </div>
        </div>
      </body>
    </html>
  `

  const printFrame = document.createElement("iframe")
  printFrame.style.position = "fixed"
  printFrame.style.right = "0"
  printFrame.style.bottom = "0"
  printFrame.style.width = "0"
  printFrame.style.height = "0"
  printFrame.style.border = "0"
  document.body.appendChild(printFrame)

  const doc = printFrame.contentWindow?.document || printFrame.contentDocument
  if (doc) {
    doc.open()
    doc.write(printHtml)
    doc.close()

    setTimeout(() => {
      printFrame.contentWindow?.focus()
      printFrame.contentWindow?.print()
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame)
        }
      }, 2000)
    }, 300)
  }
}
