import type { DrugFieldMeta, DrugNotes, StudentProfile } from "@/lib/types"

export const APP_NAME = "PharmaLog PKPA"
export const APP_SUBTITLE = "Interactive Drug Learning & Portfolio System"
export const APP_VERSION = "1.0.0"
export const STORAGE_KEY = "pharmalog-pkpa-v1"
export const AUTH_STORAGE_KEY = "pharmalog-pkpa-auth"
export const CACHE_STORAGE_PREFIX = "pharmalog-pkpa-cache:"
export const RECENT_LIMIT = 5
export const TOTAL_FIELDS = 7
export const ADMIN_NIM = "ADMIN001"
export const ADMIN_NAME = "Admin PKPA"

export const EMPTY_NOTES: DrugNotes = {
  mechanism: "",
  indication: "",
  dosage: "",
  usage: "",
  sideEffects: "",
  patientEducation: "",
  brands: "",
  contraindications: "",
  interactions: "",
  specialInstructions: "",
  tags: [],
}

export const EMPTY_PROFILE: StudentProfile = {
  id: "",
  name: "",
  nim: "",
  pharmacy: "",
  pharmacyName: "",
  preceptor: "",
  preceptorName: "",
  period: "",
  role: "student",
}

export const DRUG_FIELDS: DrugFieldMeta[] = [
  {
    key: "mechanism",
    label: "Mekanisme Kerja",
    hint: "Bagaimana obat ini bekerja di tubuh?",
    placeholder:
      "Contoh: Menghambat enzim COX sehingga menurunkan sintesis prostaglandin...",
  },
  {
    key: "indication",
    label: "Indikasi Utama",
    hint: "Untuk kondisi apa obat ini digunakan?",
    placeholder: "Contoh: Nyeri ringan–sedang, demam, dismenore...",
  },
  {
    key: "dosage",
    label: "Regimen Dosis",
    hint: "Berapa dosis, frekuensi, dan durasi yang umum?",
    placeholder: "Contoh: 400 mg setiap 6–8 jam, maksimum 1200 mg/hari...",
  },
  {
    key: "usage",
    label: "Cara Penggunaan",
    hint: "Kapan diminum, dengan/tanpa makanan, atau teknik pakai?",
    placeholder: "Contoh: Diminum setelah makan untuk mengurangi iritasi lambung...",
  },
  {
    key: "sideEffects",
    label: "Efek Samping & Tanda Bahaya",
    hint: "Efek samping umum dan kapan pasien harus segera ke tenaga kesehatan?",
    placeholder:
      "Contoh: Gangguan GI; tanda bahaya: hematemesis, sesak napas, edema...",
  },
  {
    key: "patientEducation",
    label: "Edukasi Pasien",
    hint: "Apa yang wajib disampaikan saat konseling?",
    placeholder:
      "Contoh: Jangan melebihi dosis, hindari alkohol, laporkan gejala GI berat...",
  },
  {
    key: "brands",
    label: "Merk Dagang / Sediaan",
    hint: "Nama dagang dan bentuk sediaan yang dijumpai di apotek praktek.",
    placeholder: "Contoh: Proris tab 400 mg, Ibuprofen sirup 100 mg/5 mL...",
  },
]

export const MEDICAL_DISCLAIMER =
  "Informasi dalam PharmaLog PKPA disusun untuk keperluan pembelajaran Praktek Kerja Profesi Apoteker (PKPA) dan tidak menggantikan literatur resmi, protokol klinik, informasi produk, atau keputusan profesional apoteker/dokter. Dosis, indikasi, dan cara pakai dapat berbeda sesuai kondisi pasien, sediaan, komorbiditas, dan pedoman terkini. Selalu verifikasi ke sumber terpercaya (ISO Farmakoterapi, MIMS, BPOM, leaflet pabrik, dan pedoman terapi) sebelum praktik klinik."

export const STATUS_LABEL: Record<"not-started" | "in-progress" | "completed", string> = {
  "not-started": "Belum mulai",
  "in-progress": "Sedang",
  completed: "Selesai",
}
