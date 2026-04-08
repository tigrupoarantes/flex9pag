import { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'

interface AppShellProps {
  children: ReactNode
  isAdmin?: boolean
}

export function AppShell({ children, isAdmin = false }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopBar isAdmin={isAdmin} />
      <main className="pt-14 pb-24 lg:pb-12 min-h-screen">
        <div className="max-w-2xl lg:max-w-5xl mx-auto px-5 lg:px-8 py-8 lg:py-12">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
