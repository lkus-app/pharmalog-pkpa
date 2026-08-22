import { slugify } from "@/lib/utils"
import type { Drug, TherapyGroup, TherapyIconName } from "@/lib/types"

interface RawTherapy {
  name: string
  description: string
  icon: TherapyIconName
  drugs: string[]
}

const RAW_THERAPIES: RawTherapy[] = [
  {
    name: "Analgetika non-narkotika",
    description: "Pereda nyeri dan antipiretik non-opioid yang sering dijumpai di pelayanan komunitas.",
    icon: "pill",
    drugs: ["Ibuprofen", "Ketoprofen", "Diklofenak", "Parasetamol"],
  },
  {
    name: "Antipirai",
    description: "Terapi gout: penurun asam urat dan reliever serangan akut.",
    icon: "bone",
    drugs: ["Alopurinol", "Kolkisin"],
  },
  {
    name: "Antelmintik",
    description: "Obat cacing dan infeksi parasit yang masih relevan di praktik apotek Indonesia.",
    icon: "bug",
    drugs: [
      "Albendazol",
      "Mebendazol",
      "Pirantel pamoat",
      "Dietil karbamazepin",
      "Prazikuantel",
    ],
  },
  {
    name: "Antifungi sistemik",
    description: "Antijamur sistemik untuk kandidiasis, dermatofitosis berat, dan infeksi dalam.",
    icon: "shield",
    drugs: ["Amfoterisin", "Flukonazol", "Griseofulvin", "Ketokonazol", "Nistatin"],
  },
  {
    name: "Antivirus",
    description: "Kelompok antivirus termasuk antiherpes dan terapi HIV (ARV).",
    icon: "virus",
    drugs: ["Antiherpes", "ARV (NRTI/NNRTI)", "Protease inhibitor"],
  },
  {
    name: "Antimigren",
    description: "Obat serangan migrain yang masih tercantum dalam daftar pembelajaran PKPA.",
    icon: "brain",
    drugs: ["Ergotamin", "Kafein"],
  },
  {
    name: "Antineoplastik, imunosupresan, paliatif",
    description: "Obat penunjang onkologi, hormon, kortikosteroid, dan pelindung sitotoksik.",
    icon: "activity",
    drugs: [
      "Anastrozol",
      "Deksametason",
      "Metilprednisolon",
      "Tamoksifen",
      "Kalsium folinat",
      "Mesna",
    ],
  },
  {
    name: "Antianemia",
    description: "Suplemen untuk anemia defisiensi besi dan defisiensi folat.",
    icon: "droplets",
    drugs: ["Asam folat", "Garam besi"],
  },
  {
    name: "Antiseptik & perawatan saluran akar gigi",
    description: "Sediaan kedokteran gigi yang mungkin dijumpai di apotek atau klinik.",
    icon: "smile",
    drugs: [
      "Eugenol",
      "Formokresol",
      "Kalsium hidroksida",
      "Klorheksidin",
      "Natrium hipoklorit",
    ],
  },
  {
    name: "Antifungi orofaringeal",
    description: "Terapi kandidiasis rongga mulut yang sering dikonselingkan di apotek.",
    icon: "mic",
    drugs: ["Nistatin"],
  },
  {
    name: "Antidiabetes",
    description: "Obat hipoglikemik oral dan insulin untuk tata laksana diabetes mellitus.",
    icon: "syringe",
    drugs: ["Sulfonilurea", "Metformin", "Insulin (parenteral)"],
  },
  {
    name: "Hormon kelamin & obat fertilitas",
    description: "Hormon seks, progestin, dan kontrasepsi hormonal.",
    icon: "heart",
    drugs: [
      "Testosteron",
      "Estrogen",
      "Progesteron (MPA, noretisteron)",
      "Kontrasepsi",
    ],
  },
  {
    name: "Hormon tiroid & antitiroid",
    description: "Terapi hipotiroid, sediaan iodin, dan obat antitiroid.",
    icon: "flame",
    drugs: ["Levotiroksin", "Lugol", "Propiltiourasil", "Tiamazol"],
  },
  {
    name: "Kortikosteroid sistemik",
    description: "Glukokortikoid sistemik: indikasi, tapering, dan kewaspadaan jangka panjang.",
    icon: "wind",
    drugs: ["Deksametason", "Hidrokortison", "Metilprednisolon", "Prednison"],
  },
  {
    name: "Antihipertensi",
    description: "CCB, beta blocker, diuretik, ARB, dan ACE inhibitor yang paling sering diresepkan.",
    icon: "heart-pulse",
    drugs: [
      "Amlodipin",
      "Bisoprolol",
      "Diltiazem",
      "Hidroklortiazid",
      "Kandesartan",
      "Kaptopril",
      "Valsartan",
    ],
  },
  {
    name: "Antihiperlipidemia",
    description: "Statin dan fibrat untuk dislipidemia.",
    icon: "waves",
    drugs: ["Fenofibrat", "Gemfibrozil", "Simvastatin"],
  },
  {
    name: "Obat topikal kulit",
    description: "Kelas sediaan topikal dermatologi yang sering diminta di apotek.",
    icon: "sparkles",
    drugs: [
      "Antiakne",
      "Antibakteri",
      "Antifungi",
      "Antiinflamasi/antipruritus",
      "Antiskabies",
      "Keratolitik",
    ],
  },
  {
    name: "Elektrolit oral",
    description: "Rehidrasi oral dan koreksi elektrolit yang tersedia di apotek.",
    icon: "glass-water",
    drugs: ["Oralit", "Kalium klorida", "Natrium bikarbonat"],
  },
  {
    name: "Obat mata",
    description: "Sediaan oftalmik: anestesi lokal, antimikroba, dan antiglaukoma.",
    icon: "eye",
    drugs: ["Anestetik lokal", "Antimikroba", "Miotik/antiglaukoma"],
  },
  {
    name: "Obat ADHD",
    description: "Stimulan yang digunakan pada tata laksana ADHD.",
    icon: "zap",
    drugs: ["Metilfenidat"],
  },
  {
    name: "Obat saluran cerna",
    description: "Obat simtomatik GI: antasida, antiemetik, antidiare, dan laksatif.",
    icon: "apple",
    drugs: ["Antasida", "Antiemetik", "Antispasmodik", "Antidiare", "Katartik"],
  },
  {
    name: "Obat saluran pernapasan",
    description: "Terapi asma, antitusif, dan ekspektoran yang sering dikonselingkan.",
    icon: "air-vent",
    drugs: ["Antiasma", "Antitusif (kodein)", "Ekspektoran (n-asetilsistein)"],
  },
  {
    name: "Vitamin dan mineral",
    description: "Mikronutrien yang sering diresepkan atau diminta swamedikasi.",
    icon: "leaf",
    drugs: [
      "Vitamin C",
      "Vitamin D",
      "Kalsium glukonat/karbonat",
      "Besi–asam folat",
      "Piridoksin",
      "Retinoid",
    ],
  },
]

export const THERAPY_GROUPS: TherapyGroup[] = RAW_THERAPIES.map((group) => {
  const therapyId = slugify(group.name)
  return {
    id: therapyId,
    name: group.name,
    description: group.description,
    icon: group.icon,
    drugs: group.drugs.map((drugName) => ({
      id: `${therapyId}--${slugify(drugName)}`,
      name: drugName,
      therapyId,
    })),
  }
})

export const ALL_DRUGS: Drug[] = THERAPY_GROUPS.flatMap((group) => group.drugs)

export const THERAPY_COUNT = THERAPY_GROUPS.length
export const DRUG_COUNT = ALL_DRUGS.length

const therapyById = new Map(THERAPY_GROUPS.map((group) => [group.id, group]))
const drugById = new Map(ALL_DRUGS.map((drug) => [drug.id, drug]))

export function getTherapyById(id: string): TherapyGroup | undefined {
  return therapyById.get(id)
}

export function getDrugById(id: string): Drug | undefined {
  return drugById.get(id)
}

export function getDrugsInTherapy(therapyId: string): Drug[] {
  return getTherapyById(therapyId)?.drugs ?? []
}

export function getAdjacentDrugs(therapyId: string, drugId: string) {
  const drugs = getDrugsInTherapy(therapyId)
  const index = drugs.findIndex((drug) => drug.id === drugId)
  return {
    previous: index > 0 ? drugs[index - 1] : undefined,
    next: index >= 0 && index < drugs.length - 1 ? drugs[index + 1] : undefined,
    index,
    total: drugs.length,
  }
}

export function searchCatalog(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) {
    return { therapies: [] as TherapyGroup[], drugs: [] as Array<Drug & { therapyName: string }> }
  }

  const therapies = THERAPY_GROUPS.filter(
    (group) =>
      group.name.toLowerCase().includes(q) ||
      group.description.toLowerCase().includes(q)
  ).slice(0, 6)

  const drugs = ALL_DRUGS.filter((drug) => drug.name.toLowerCase().includes(q))
    .slice(0, 8)
    .map((drug) => ({
      ...drug,
      therapyName: getTherapyById(drug.therapyId)?.name ?? "",
    }))

  return { therapies, drugs }
}
