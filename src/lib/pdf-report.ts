import { THERAPIES, getAllDrugs } from "@/lib/therapies"
import { getFilledNotesCount, hasNotesContent } from "@/lib/mappers"
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

function escapeHtml(str?: string): string {
  if (!str || str.trim() === "") return "-"
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export function renderStudentSection(student: StudentReportData, index: number, isSingle: boolean): string {
  const { profile, entries = {} } = student
  const allDrugs = getAllDrugs()
  const totalDrugs = allDrugs.length

  let completedCount = 0
  let filledNotesCount = 0

  const therapyDetails: {
    therapyName: string
    therapyId: string
    drugs: Array<{
      id: string
      name: string
      notes: DrugNotes
      isCompleted: boolean
      hasContent: boolean
      updatedAt?: string
    }>
  }[] = []

  for (const therapy of THERAPIES) {
    const therapyDrugsList = []
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
      const hasContent = hasNotesContent(notes)

      if (isCompleted) completedCount++
      if (hasContent) filledNotesCount++

      therapyDrugsList.push({
        id: drug.id,
        name: drug.name,
        notes,
        isCompleted,
        hasContent,
        updatedAt: entry?.updatedAt,
      })
    }

    therapyDetails.push({
      therapyName: therapy.name,
      therapyId: therapy.id,
      drugs: therapyDrugsList,
    })
  }

  const completionPercentage = totalDrugs > 0 ? Math.round((completedCount / totalDrugs) * 100) : 0

  return `
    <div class="student-page ${!isSingle ? 'page-break' : ''}" style="width: 794px; padding: 32px 36px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background: #ffffff;">
      <!-- Header Dokumen PKPA Resmi -->
      <div style="border-bottom: 2px solid #059669; padding-bottom: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div style="flex: 1;">
          <h1 style="font-size: 15px; font-weight: 800; color: #065f46; text-transform: uppercase; margin: 0 0 4px 0; letter-spacing: 0.5px; line-height: 1.3;">
            LEMBAR KERJA &amp; LOGBOOK KLINIS PRAKTIK KERJA PROFESI APOTEKER (PKPA)
          </h1>
          <p style="font-size: 11px; color: #475569; margin: 0; font-weight: 500;">
            Sistem Informasi Logbook Farmasi Klinis &bull; PharmaLog PKPA
          </p>
        </div>
        <div style="text-align: right; margin-left: 16px;">
          <div style="display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 6px;">
            DOKUMEN EVALUASI KLINIS
          </div>
          <p style="font-size: 9px; color: #64748b; margin: 4px 0 0 0;">
            Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <!-- Tabel Data Identitas Mahasiswa -->
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; margin-bottom: 22px;">
        <table style="width: 100%; font-size: 11px; border-collapse: collapse; line-height: 1.5;">
          <tr>
            <td style="width: 20%; font-weight: 700; color: #334155; padding: 2px 0;">Nama Mahasiswa</td>
            <td style="width: 30%; color: #0f172a; font-weight: 700; padding: 2px 0;">: ${escapeHtml(profile.name)}</td>
            <td style="width: 22%; font-weight: 700; color: #334155; padding: 2px 0;">Wahana / Apotek PKPA</td>
            <td style="width: 28%; color: #0f172a; padding: 2px 0;">: ${escapeHtml(profile.pharmacyName)}</td>
          </tr>
          <tr>
            <td style="font-weight: 700; color: #334155; padding: 2px 0;">NIM</td>
            <td style="color: #0f172a; font-weight: 600; padding: 2px 0;">: ${escapeHtml(profile.nim)}</td>
            <td style="font-weight: 700; color: #334155; padding: 2px 0;">Apoteker Preseptor</td>
            <td style="color: #0f172a; padding: 2px 0;">: ${escapeHtml(profile.preceptorName)}</td>
          </tr>
          <tr>
            <td style="font-weight: 700; color: #334155; padding: 2px 0;">Capaian Selesai</td>
            <td style="color: #059669; font-weight: 700; padding: 2px 0;">: ${completedCount} / ${totalDrugs} Obat (${completionPercentage}%)</td>
            <td style="font-weight: 700; color: #334155; padding: 2px 0;">Periode PKPA</td>
            <td style="color: #0f172a; padding: 2px 0;">: ${escapeHtml(profile.period)}</td>
          </tr>
        </table>
      </div>

      <!-- Ringkasan Statistik Progress 23 Terapi -->
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 12px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; border-bottom: 1.5px solid #059669; padding-bottom: 4px; text-transform: uppercase;">
          I. REKAPITULASI CAPAIAN 23 KELAS TERAPI
        </h2>
        <table style="width: 100%; font-size: 10px; border-collapse: collapse; margin-top: 6px;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left; color: #1e293b;">
              <th style="border: 1px solid #cbd5e1; padding: 6px 8px; width: 6%; text-align: center;">No</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px 8px; width: 44%;">Kelas Terapi</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px 8px; width: 16%; text-align: center;">Jumlah Obat</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px 8px; width: 16%; text-align: center;">Catatan Klinis</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px 8px; width: 18%; text-align: center;">Status Capaian</th>
            </tr>
          </thead>
          <tbody>
            ${therapyDetails.map((td, tIdx) => {
              const tCompleted = td.drugs.filter(d => d.isCompleted).length
              const tFilled = td.drugs.filter(d => d.hasContent).length
              const tTotal = td.drugs.length
              const isAllDone = tCompleted === tTotal && tTotal > 0
              return `
                <tr style="background: ${tIdx % 2 === 0 ? '#ffffff' : '#f8fafc'}; color: #1e293b;">
                  <td style="border: 1px solid #cbd5e1; padding: 4px 8px; text-align: center; color: #64748b;">${tIdx + 1}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 4px 8px; font-weight: 600; color: #0f172a;">${escapeHtml(td.therapyName)}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 4px 8px; text-align: center;">${tTotal} Obat</td>
                  <td style="border: 1px solid #cbd5e1; padding: 4px 8px; text-align: center; color: #0f172a;">${tFilled} / ${tTotal} Terisi</td>
                  <td style="border: 1px solid #cbd5e1; padding: 4px 8px; text-align: center; font-weight: 700; color: ${isAllDone ? '#059669' : tCompleted > 0 ? '#0284c7' : '#64748b'};">
                    ${isAllDone ? '✓ Lengkap' : `${tCompleted}/${tTotal} Selesai`}
                  </td>
                </tr>
              `
            }).join("")}
          </tbody>
        </table>
      </div>

      <!-- Rincian Catatan Parameter Klinis Seluruh Obat -->
      <div style="margin-top: 24px;">
        <h2 style="font-size: 12px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; border-bottom: 1.5px solid #059669; padding-bottom: 4px; text-transform: uppercase;">
          II. LEMBAR KERJA PARAMETER KLINIS OBAT (HASIL INPUTAN MAHASISWA)
        </h2>

        ${therapyDetails.map((td) => {
          const filledDrugs = td.drugs.filter(d => d.hasContent || d.isCompleted)
          if (filledDrugs.length === 0) {
            return `
              <div style="margin-bottom: 12px; padding: 8px 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
                <p style="font-size: 10px; font-weight: 700; color: #64748b; margin: 0;">
                  Kelas Terapi: ${escapeHtml(td.therapyName)} (Belum ada catatan yang diisi pada kelas terapi ini)
                </p>
              </div>
            `
          }

          return `
            <div style="margin-bottom: 18px; page-break-inside: avoid;">
              <h3 style="font-size: 11px; font-weight: 700; color: #065f46; background: #ecfdf5; padding: 6px 10px; border-left: 4px solid #059669; margin: 0 0 8px 0; border-radius: 0 4px 4px 0;">
                Kelas Terapi: ${escapeHtml(td.therapyName)}
              </h3>

              ${filledDrugs.map((drug) => {
                const n = drug.notes
                return `
                  <div style="border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 10px; padding: 10px; background: #ffffff; page-break-inside: avoid;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
                      <span style="font-size: 11px; font-weight: 700; color: #0f172a;">${escapeHtml(drug.name)}</span>
                      <span style="font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${drug.isCompleted ? '#dcfce7; color: #15803d' : '#fef3c7; color: #b45309'};">
                        ${drug.isCompleted ? '✓ Selesai Dipelajari' : 'Sedang Dipelajari'}
                      </span>
                    </div>

                    <table style="width: 100%; font-size: 10px; border-collapse: collapse; line-height: 1.45;">
                      <tr>
                        <td style="width: 25%; font-weight: 700; color: #475569; padding: 2px 0; vertical-align: top;">1. Indikasi Klinis</td>
                        <td style="width: 75%; color: #1e293b; padding: 2px 0; vertical-align: top;">: ${escapeHtml(n.indication || "-")}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 700; color: #475569; padding: 2px 0; vertical-align: top;">2. Dosis Lazim</td>
                        <td style="color: #1e293b; padding: 2px 0; vertical-align: top;">: ${escapeHtml(n.dosage || "-")}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 700; color: #475569; padding: 2px 0; vertical-align: top;">3. Aturan / Cara Pakai</td>
                        <td style="color: #1e293b; padding: 2px 0; vertical-align: top;">: ${escapeHtml(n.specialInstructions || "-")}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 700; color: #475569; padding: 2px 0; vertical-align: top;">4. Efek Samping</td>
                        <td style="color: #1e293b; padding: 2px 0; vertical-align: top;">: ${escapeHtml(n.sideEffects || "-")}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 700; color: #475569; padding: 2px 0; vertical-align: top;">5. Kontraindikasi</td>
                        <td style="color: #1e293b; padding: 2px 0; vertical-align: top;">: ${escapeHtml(n.contraindications || "-")}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 700; color: #475569; padding: 2px 0; vertical-align: top;">6. Interaksi Obat</td>
                        <td style="color: #1e293b; padding: 2px 0; vertical-align: top;">: ${escapeHtml(n.interactions || "-")}</td>
                      </tr>
                    </table>
                  </div>
                `
              }).join("")}
            </div>
          `
        }).join("")}
      </div>

      <!-- Tanda Tangan Pembimbing & Mahasiswa -->
      <div style="margin-top: 36px; padding-top: 16px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; page-break-inside: avoid; font-size: 11px;">
        <div style="text-align: center; width: 42%;">
          <p style="margin: 0 0 55px 0; color: #475569; font-weight: 500;">Mahasiswa Praktikan,</p>
          <p style="margin: 0; font-weight: 700; color: #0f172a; text-decoration: underline;">
            ${escapeHtml(profile.name || "( ................................................ )")}
          </p>
          <p style="margin: 3px 0 0 0; color: #64748b; font-size: 10px;">
            NIM: ${escapeHtml(profile.nim || "-")}
          </p>
        </div>

        <div style="text-align: center; width: 42%;">
          <p style="margin: 0 0 55px 0; color: #475569; font-weight: 500;">Apoteker Preseptor / Pembimbing,</p>
          <p style="margin: 0; font-weight: 700; color: #0f172a; text-decoration: underline;">
            ${escapeHtml(profile.preceptorName || "( ................................................ )")}
          </p>
          <p style="margin: 3px 0 0 0; color: #64748b; font-size: 10px;">
            SIPAP / STRA: .......................................
          </p>
        </div>
      </div>
    </div>
  `
}

async function renderPdfWithFallback(container: HTMLElement, filename: string): Promise<void> {
  // Tunggu sejenak agar layout browser dan font stabil
  await new Promise((r) => setTimeout(r, 150))

  try {
    const html2pdfModule = await import("html2pdf.js")
    const html2pdf = (html2pdfModule as any).default || html2pdfModule

    const opt = {
      margin: [8, 8, 8, 8],
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: 800,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ["css", "legacy"] },
    }

    await html2pdf().set(opt).from(container).save()
  } catch (err) {
    console.error("html2pdf error, using print fallback:", err)
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${filename.replace(/\.pdf$/i, "")}</title>
            <meta charset="utf-8" />
            <style>
              body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; background: #ffffff; color: #1e293b; }
              @page { size: A4; margin: 10mm; }
              .page-break { page-break-before: always; }
              @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>${container.innerHTML}</body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }
}

export async function generateStudentPdf(
  student: StudentReportData,
  filename?: string
): Promise<void> {
  const safeFilename = filename || formatStudentFilename(student.profile, "pdf")

  const container = document.createElement("div")
  container.id = "pdf-render-single-container"
  // Pastikan posisi terlihat oleh html2canvas (bukan minus koordinat)
  container.style.position = "fixed"
  container.style.top = "0"
  container.style.left = "0"
  container.style.width = "794px"
  container.style.zIndex = "99999"
  container.style.background = "#ffffff"
  container.style.boxShadow = "none"
  container.innerHTML = renderStudentSection(student, 0, true)

  document.body.appendChild(container)

  try {
    await renderPdfWithFallback(container, safeFilename)
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container)
    }
  }
}

export async function generateAllStudentsPdf(
  students: StudentReportData[],
  filename?: string
): Promise<void> {
  const safeFilename = filename || `Rekapitulasi_PKPA_Semua_Mahasiswa_${new Date().toISOString().slice(0, 10)}.pdf`

  if (!students || students.length === 0) {
    throw new Error("Tidak ada data mahasiswa untuk dicetak.")
  }

  const container = document.createElement("div")
  container.id = "pdf-render-all-container"
  container.style.position = "fixed"
  container.style.top = "0"
  container.style.left = "0"
  container.style.width = "794px"
  container.style.zIndex = "99999"
  container.style.background = "#ffffff"
  container.style.boxShadow = "none"

  // Halaman Cover / Rekapitulasi Global
  let html = `
    <div style="width: 794px; padding: 32px 36px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; color: #1e293b; background: #ffffff;" class="page-break">
      <div style="border-bottom: 2px solid #059669; padding-bottom: 14px; margin-bottom: 20px; text-align: center;">
        <h1 style="font-size: 16px; font-weight: 800; color: #065f46; margin: 0 0 6px 0; text-transform: uppercase;">
          LAPORAN REKAPITULASI HASIL INPUTAN PKPA APOTEKER
        </h1>
        <p style="font-size: 11px; color: #475569; margin: 0;">
          Kompilasi Seluruh Lembar Kerja &amp; Portofolio Klinis Mahasiswa PKPA Farmasi
        </p>
        <p style="font-size: 10px; color: #64748b; margin: 4px 0 0 0;">
          Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} &bull; Total Mahasiswa: ${students.length} Orang
        </p>
      </div>

      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 12px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; text-transform: uppercase;">
          DAFTAR REKAPITULASI MAHASISWA PRAKTIKAN
        </h2>
        <table style="width: 100%; font-size: 10px; border-collapse: collapse;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left; color: #1e293b;">
              <th style="border: 1px solid #cbd5e1; padding: 6px; width: 6%; text-align: center;">No</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px; width: 26%;">Nama Mahasiswa</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px; width: 16%;">NIM</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px; width: 24%;">Wahana PKPA</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px; width: 14%; text-align: center;">Obat Selesai</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px; width: 14%; text-align: center;">Catatan Klinis</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((s, idx) => {
              const allDrugsCount = getAllDrugs().length
              const completed = Object.values(s.entries || {}).filter(e => e?.markedComplete).length
              const filled = Object.values(s.entries || {}).filter(e => hasNotesContent(e?.notes)).length
              return `
                <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; color: #1e293b;">
                  <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; color: #64748b;">${idx + 1}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px; font-weight: 700; color: #0f172a;">${escapeHtml(s.profile.name)}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px;">${escapeHtml(s.profile.nim)}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px;">${escapeHtml(s.profile.pharmacyName)}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; font-weight: 700; color: #059669;">
                    ${completed} / ${allDrugsCount}
                  </td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; color: #0284c7; font-weight: 600;">
                    ${filled} Obat
                  </td>
                </tr>
              `
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `

  // Detail seluruh mahasiswa
  students.forEach((student, index) => {
    html += renderStudentSection(student, index, false)
  })

  container.innerHTML = html
  document.body.appendChild(container)

  try {
    await renderPdfWithFallback(container, safeFilename)
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container)
    }
  }
}
