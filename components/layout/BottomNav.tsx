'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Receipt, HandCoins, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/inicio', label: 'Início', Icon: Home },
  { href: '/servicos', label: 'Serviços', Icon: Receipt },
  { href: '/cobrar', label: 'Cobrar', Icon: HandCoins },
  { href: '/configuracoes', label: 'Mais', Icon: Menu },
]

/**
 * Bottom nav Apple-style: branca opaca, hairline em cima, 4 ícones.
 * Ativo = preto, inativo = cinza. Sem pílulas, sem glass exagerado.
 */
export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'lg:hidden fixed bottom-0 inset-x-0 z-50',
        'bg-white/95 backdrop-blur-xl',
        'border-t border-border',
        'safe-area-pb'
      )}
    >
      <div className="max-w-lg mx-auto flex items-stretch justify-around h-14">
        {NAV.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                'min-h-[48px]',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              <Icon className="size-[22px]" strokeWidth={isActive ? 2.25 : 1.75} />
              <span className="text-[10px] font-medium tracking-tight">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
