"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <h1 className="font-heading text-2xl font-semibold">Terjadi kesalahan</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Aplikasi gagal merender halaman ini. Coba muat ulang. Data di LocalStorage tidak ikut terhapus.
      </p>
      <Button onClick={reset}>Coba lagi</Button>
    </div>
  )
}
