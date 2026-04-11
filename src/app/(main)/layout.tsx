import Sidebar from '@/components/Sidebar'
import AIChatButton from '@/components/AIChatButton'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
      <AIChatButton />
    </div>
  )
}
