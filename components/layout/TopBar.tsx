'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface TopBarProps {
  isAdmin?: boolean
  className?: string
}

const NAV = [
  { href: '/inicio', label: 'Início' },
  { href: '/servicos', label: 'Serviços' },
  { href: '/clientes', label: 'Clientes' },
  { href: '/das', label: 'DAS' },
  { href: '/configuracoes', label: 'Configurações' },
]

export function TopBar({ isAdmin = false, className }: TopBarProps) {
  const pathname = usePathname()

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-40 h-14 bg-white/90 backdrop-blur-xl border-b border-border',
        className
      )}
    >
      <div className="h-full max-w-5xl mx-auto px-5 lg:px-8 flex items-center justify-between">
        <Link
          href="/inicio"
          className="text-[17px] font-semibold tracking-tight text-foreground"
        >
          flex9pag
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                {item.label}
              </Link>
            )
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className="ml-2 px-3 py-1.5 rounded-md text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/15 transition-colors"
            >
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
