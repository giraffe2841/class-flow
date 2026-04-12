import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ClassFlow | Simplified Planning for Educators',
  description: '선생님을 위한 AI 수업 진도 관리 서비스',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased min-h-full"
        style={{
          fontFamily: "'Inter', sans-serif",
          backgroundColor: '#ffffff',
          letterSpacing: '-0.03em',
          color: '#0A0A0B',
        }}
      >
        {children}
      </body>
    </html>
  )
}
