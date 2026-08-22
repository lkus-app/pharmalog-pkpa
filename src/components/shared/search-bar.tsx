"use client"

import { Search, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { searchCatalog } from "@/lib/catalog"
import { cn } from "@/lib/utils"

export function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => searchCatalog(query), [query])
  const hasQuery = query.trim().length > 0
  const hasResults = results.therapies.length > 0 || results.drugs.length > 0

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "/" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Cari obat atau kelompok terapi..."
        className="h-9 bg-background pr-8 pl-8"
        aria-label="Cari obat atau kelompok terapi"
      />
      {query ? (
        <button
          type="button"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          onClick={() => {
            setQuery("")
            inputRef.current?.focus()
          }}
          aria-label="Hapus pencarian"
        >
          <X className="size-3.5" />
        </button>
      ) : null}

      {open && hasQuery ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border bg-popover shadow-lg ring-1 ring-foreground/10">
          {!hasResults ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              Tidak ada hasil untuk “{query.trim()}”.
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto py-2">
              {results.therapies.length > 0 ? (
                <div className="px-2 pb-2">
                  <p className="px-2 py-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Kelompok terapi
                  </p>
                  {results.therapies.map((group) => (
                    <Link
                      key={group.id}
                      href={`/learning/${group.id}`}
                      onClick={() => {
                        setOpen(false)
                        setQuery("")
                      }}
                      className="block rounded-lg px-2 py-2 text-sm hover:bg-muted"
                    >
                      <span className="font-medium">{group.name}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {group.drugs.length} obat
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}
              {results.drugs.length > 0 ? (
                <div className="px-2">
                  <p className="px-2 py-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Obat
                  </p>
                  {results.drugs.map((drug) => (
                    <Link
                      key={drug.id}
                      href={`/learning/${drug.therapyId}/${drug.id}`}
                      onClick={() => {
                        setOpen(false)
                        setQuery("")
                      }}
                      className="block rounded-lg px-2 py-2 text-sm hover:bg-muted"
                    >
                      <span className="font-medium">{drug.name}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {drug.therapyName}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
