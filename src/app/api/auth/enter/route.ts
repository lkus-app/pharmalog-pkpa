import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    const cleanUrl = rawUrl.trim().replace(/\/+$/, '')
    const cleanKey = serviceRoleKey.trim()

    if (!cleanUrl || !cleanKey) {
      return NextResponse.json(
        { error: 'SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum terpasang di Vercel' },
        { status: 500 }
      )
    }

    // Gunakan service role agar bypass RLS saat login/registrasi
    const supabaseAdmin = createClient(cleanUrl, cleanKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const body = await request.json()
    const cleanName = (body.name || '').trim()
    const cleanNim = (body.nim || '').trim()

    if (!cleanName || !cleanNim) {
      return NextResponse.json({ error: 'Nama dan NIM wajib diisi' }, { status: 400 })
    }

    // 1. Cek apakah NIM sudah terdaftar
    const { data: existingStudent, error: selectError } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('nim', cleanNim)
      .maybeSingle()

    if (selectError) {
      return NextResponse.json({ error: selectError.message }, { status: 500 })
    }

    let student = existingStudent

    // 2. Buat mahasiswa baru jika belum ada
    if (!existingStudent) {
      const isInitialAdmin = cleanNim.toUpperCase() === 'ADMIN001'
      const { data: newStudent, error: insertError } = await supabaseAdmin
        .from('students')
        .insert([
          {
            name: cleanName,
            nim: cleanNim,
            role: isInitialAdmin ? 'admin' : 'student',
          },
        ])
        .select()
        .single()

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
      student = newStudent
    }

    return NextResponse.json({ success: true, student }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan pada server' }, { status: 500 })
  }
}
