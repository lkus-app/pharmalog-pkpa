"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { STATUS_LABEL } from "@/lib/constants"
import type { SortKey, StatusFilter } from "@/lib/types"
import { cn } from "@/lib/utils"

const FILTERS: StatusFilter[] = ["all", "not-started", "in-progress", "completed"]

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "name-asc", label: "Nama A–Z" },
  { value: "name-desc", label: "Nama Z–A" },
  { value: "progress-desc", label: "Progress tinggi → rendah" },
  { value: "progress-asc", label: "Progress rendah → tinggi" },
]

export function FilterBar({
  filter,
  sort,
  onFilterChange,
  onSortChange,
  className,
}: {
  filter: StatusFilter
  sort: SortKey
  onFilterChange: (value: StatusFilter) => void
  onSortChange: (value: SortKey) => void
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between", className)}>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Button
            key={item}
            type="button"
            size="sm"
            variant={filter === item ? "default" : "outline"}
            onClick={() => onFilterChange(item)}
          >
            {item === "all" ? "Semua" : STATUS_LABEL[item]}
          </Button>
        ))}
      </div>
      <Select value={sort} onValueChange={(value) => onSortChange(value as SortKey)}>
        <SelectTrigger className="w-full lg:w-64" aria-label="Urutkan">
          <SelectValue placeholder="Urutkan" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
