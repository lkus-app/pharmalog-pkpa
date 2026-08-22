import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-xs font-semibold tracking-[0.2em] text-sky-700 uppercase">404</p>
      <h1 className="font-heading text-2xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Tautan yang Anda buka tidak ada dalam PharmaLog PKPA.
      </p>
      <Button render={<Link href="/" />}>Kembali ke dashboard</Button>
    </div>
  )
}
