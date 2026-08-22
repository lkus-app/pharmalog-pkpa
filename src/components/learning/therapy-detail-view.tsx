"use client"

import { ChevronRight, SearchX } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useAppStore } from "@/components/app-store-provider"
import { DrugCard } from "@/components/learning/drug-card"
import { EmptyState } from "@/components/shared/empty-state"
import { FilterBar } from "@/components/shared/filter-bar"
import { LinearProgress } from "@/components/shared/linear-progress"
import { PageHeader } from "@/components/shared/page-header"
import { CardGridSkeleton } from "@/components/shared/page-skeleton"
import { StatusBadge } from "@/components/shared/status-badge"
import { Input } from "@/components/ui/input"
import { getTherapyById } from "@/lib/catalog"
import { THERAPY_ICONS } from "@/lib/icons"
import { compareBySort, getDrugProgress, getTherapyProgress } from "@/lib/progress"
import type { SortKey, StatusFilter } from "@/lib/types"

export function TherapyDetailView({ therapyId }: { therapyId: string }) {
  const { data, hydrated, viewTherapy } = useAppStore()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [sort, setSort] = useState<SortKey>("name-asc")
  const therapy = getTherapyById(therapyId)

  useEffect(() => {
    if (hydrated && therapy) viewTherapy(therapy.id)
  }, [hydrated, therapy, viewTherapy])

  const progress = therapy ? getTherapyProgress(therapy.id, data.entries) : null
  const Icon = therapy ? THERAPY_ICONS[therapy.icon] : null

  const items = useMemo(() => {
    if (!therapy) return []
    const q = query.trim().toLowerCase()
    return therapy.drugs
      .map((drug) => {
        const drugProgress = getDrugProgress(data.entries[drug.id])
        return {
          drug,
          progress: drugProgress,
          name: drug.name,
          percent: drugProgress.percent,
          favorite: data.favorites.includes(drug.id),
        }
      })
      .filter((item) => {
        const matchesQuery = !q || item.drug.name.toLowerCase().includes(q)
        const matchesFilter = filter === "all" || item.progress.status === filter
        return matchesQuery && matchesFilter
      })
      .sort((a, b) => compareBySort(a, b, sort))
  }, [data.entries, data.favorites, filter, query, sort, therapy])

  if (!hydrated) {
    return (
      <div className="space-y-6">
        <PageHeader title="Kelompok terapi" />
        <CardGridSkeleton />
      </div>
    )
  }

  if (!therapy || !progress || !Icon) {
    return (
      <EmptyState
        icon={SearchX}
        title="Kelompok tidak ditemukan"
        description="Kelompok terapi ini tidak ada dalam kurikulum PharmaLog."
        action={
          <Link href="/learning" className="text-sm font-medium text-sky-800 underline">
            Kembali ke daftar pembelajaran
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/learning" className="hover:text-foreground">
          Pembelajaran
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{therapy.name}</span>
      </nav>

      <PageHeader
        eyebrow="Kelompok terapi"
        title={therapy.name}
        description={therapy.description}
      />

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-lg bg-sky-50 text-sky-800">
            <Icon className="size-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{therapy.drugs.length} obat</p>
              <StatusBadge status={progress.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {progress.completedDrugs} selesai · {progress.inProgressDrugs} sedang ·{" "}
              {progress.notStartedDrugs} belum mulai
            </p>
          </div>
        </div>
        <div className="w-full space-y-1 sm:max-w-xs">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress kelompok</span>
            <span className="font-medium text-foreground">{progress.percent}%</span>
          </div>
          <LinearProgress value={progress.percent} />
        </div>
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cari obat dalam kelompok ini..."
        className="h-9 max-w-xl bg-background"
      />
      <FilterBar
        filter={filter}
        sort={sort}
        onFilterChange={setFilter}
        onSortChange={setSort}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Tidak ada obat yang cocok"
          description="Ubah kata kunci atau filter status."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <DrugCard
              key={item.drug.id}
              drug={item.drug}
              progress={item.progress}
              favorite={item.favorite}
            />
          ))}
        </div>
      )}
    </div>
  )
}
