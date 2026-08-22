import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Providers } from "@/components/providers"
import { APP_NAME, APP_SUBTITLE } from "@/lib/constants"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} · ${APP_SUBTITLE}`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Platform pembelajaran obat PKPA: catat mekanisme kerja, indikasi, dosis, cara pakai, efek samping, edukasi pasien, dan merk dagang. Progress tersimpan di Supabase dan bisa diekspor ke PDF.",
  applicationName: APP_NAME,
  keywords: ["PKPA", "farmasi", "pembelajaran obat", "portofolio apoteker", "PharmaLog"],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
