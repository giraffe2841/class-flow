import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ClassFlow — AI 진도관리',
  description: '선생님을 위한 AI 수업 진도 관리 서비스',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Public+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-[#f8f9ff] font-[\'Public_Sans\',sans-serif] text-[#191c20]">
        {children}
      </body>
    </html>
  )
}
