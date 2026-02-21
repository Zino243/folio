import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session) {
      return NextResponse.redirect(new URL(next, request.url))
    }
    
    if (error) {
      console.error('Auth callback error:', error)
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
}
