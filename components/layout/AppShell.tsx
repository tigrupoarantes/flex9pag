import { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'

interface AppShellProps {
  children: ReactNode
}

/**
 * Shell minimal Apple-style:
 * - TopBar fixo 56px (mobile = só logo, desktop = nav inline)
 * - Main centralizado max-w-2xl no mobile, max-w-5xl desktop
 * - BottomNav só no mobile (lg:hidden)
 * - Sem side nav, sem glass exagerado, sem pílulas
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="pt-14 pb-24 lg:pb-12 min-h-screen">
        <div className="max-w-2xl lg:max-w-5xl mx-auto px-5 lg:px-8 py-8 lg:py-12">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
