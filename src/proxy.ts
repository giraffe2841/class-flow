import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 인증 불필요 경로
  const publicPaths = ['/login', '/signup', '/auth/callback', '/api/health', '/health']
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          response = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 로그인된 유저가 랜딩·로그인·회원가입 페이지 → 대시보드로
  const authOnlyPaths = ['/', '/login', '/signup']
  if (user && authOnlyPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // 비로그인 → 보호된 경로면 로그인 페이지로
  const protectedPaths = ['/dashboard', '/calendar', '/plan', '/materials', '/subscription', '/progress', '/ai', '/settings']
  if (!user && protectedPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/webhook).*)'],
}
