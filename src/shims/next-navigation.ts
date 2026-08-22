import { useState, useEffect } from "react"

export function useRouter() {
  return {
    push: (url: string) => {
      window.location.hash = url
      window.dispatchEvent(new HashChangeEvent("hashchange"))
    },
    replace: (url: string) => {
      window.location.hash = url
      window.dispatchEvent(new HashChangeEvent("hashchange"))
    },
    back: () => {
      window.history.back()
    },
    forward: () => {
      window.history.forward()
    },
    refresh: () => {
      window.location.reload()
    },
    prefetch: () => {},
  }
}

export function usePathname() {
  const [pathname, setPathname] = useState(() => {
    return window.location.hash ? window.location.hash.slice(1) : "/"
  })

  useEffect(() => {
    const handleHash = () => {
      setPathname(window.location.hash ? window.location.hash.slice(1) : "/")
    }
    window.addEventListener("hashchange", handleHash)
    return () => window.removeEventListener("hashchange", handleHash)
  }, [])

  return pathname
}

function parseHashParams(): Record<string, string> {
  if (typeof window === "undefined") return {}
  const hash = window.location.hash ? window.location.hash.slice(1) : ""
  const parts = hash.split("/").filter(Boolean)
  const res: Record<string, string> = {}
  if (parts[0] === "learning") {
    if (parts[1]) res.therapyId = decodeURIComponent(parts[1])
    if (parts[2]) res.drugId = decodeURIComponent(parts[2])
  }
  return res
}

export function useParams(): Record<string, string> {
  const [params, setParams] = useState<Record<string, string>>(parseHashParams)

  useEffect(() => {
    const parse = () => {
      setParams(parseHashParams())
    }
    parse()
    window.addEventListener("hashchange", parse)
    return () => window.removeEventListener("hashchange", parse)
  }, [])

  return params
}

export function useSearchParams() {
  return new URLSearchParams(window.location.search)
}
