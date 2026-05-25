import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  // TEST_503: 실제 서비스 503 시뮬레이션 — 테스트 완료 후 이 블록 제거
  return new NextResponse('Service Unavailable', {
    status: 503,
    headers: { 'Retry-After': '30', 'Content-Type': 'text/plain' },
  })

  const { pathname } = req.nextUrl

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

  const authOnlyPaths = ['/', '/login', '/signup']
  if (user && authOnlyPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  const protectedPaths = ['/dashboard', '/calendar', '/plan', '/materials', '/subscription', '/progress', '/ai', '/settings']
  if (!user && protectedPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/webhook).*)'],
}
