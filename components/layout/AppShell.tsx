import { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'
import { TopBar } from './TopBar'

interface AppShellProps {
  children: ReactNode
  /** Nome completo do usuário — usado para iniciais e saudação. */
  userName?: string | null
  /** Título sobrescreve "flex9pag" no TopBar (mobile). */
  title?: string
  subtitle?: string
}

function getInitial(name?: string | null): string | undefined {
  if (!name) return undefined
  const trimmed = name.trim()
  if (!trimmed) return undefined
  return trimmed[0]?.toUpperCase()
}

/**
 * Shell responsivo do flex9pag.
 *
 * - Mobile (<lg): TopBar fixo + main centralizado max-w-lg + BottomNav glass
 * - Desktop (≥lg): SideNav fixo 256px à esquerda + TopBar full-width + main fluida
 */
export function AppShell({ children, userName, title, subtitle }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface">
      <SideNav />
      <TopBar title={title} subtitle={subtitle} userInitial={getInitial(userName)} />

      {/* Main: respeita SideNav no desktop, TopBar no mobile */}
      <main className="lg:pl-64 pt-16 pb-28 lg:pb-8 min-h-screen">
        <div className="mx-auto w-full max-w-lg lg:max-w-7xl px-4 lg:px-8 py-6">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
