import * as React from "react"

declare global {
  type LayoutProps<T = any> = {
    children: React.ReactNode
    params?: Promise<T> | T
  }
}

declare module "next" {
  export type Metadata = {
    title?: string | { default: string; template?: string }
    description?: string
    applicationName?: string
    keywords?: string[]
    [key: string]: any
  }
}

declare module "next/server" {
  export class NextResponse {
    static json(data: any, init?: ResponseInit): Response
    static redirect(url: string | URL, init?: number | ResponseInit): Response
  }
  export type NextRequest = Request
}

declare module "next/font/google" {
  export function Inter(options?: any): { className: string; variable: string }
  export function Plus_Jakarta_Sans(options?: any): { className: string; variable: string }
  export function Geist(options?: any): { className: string; variable: string }
  export function Geist_Mono(options?: any): { className: string; variable: string }
}

declare module "next/og" {
  export class ImageResponse extends Response {
    constructor(element: any, options?: any)
  }
}
