import { NextResponse } from 'next/server'

export function middleware() {
  return new NextResponse('Service Unavailable', { status: 503 })
}

export const config = {
  matcher: '/(.*)',
}
