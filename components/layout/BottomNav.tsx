'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon, type IconName } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: IconName
}

const navItems: NavItem[] = [
  { href: '/inicio', label: 'Início', icon: 'home' },
  { href: '/servicos', label: 'Serviços', icon: 'receipt_long' },
  { href: '/cobrar', label: 'Cobrar', icon: 'send_money' },
  { href: '/configuracoes', label: 'Mais', icon: 'menu' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'lg:hidden fixed bottom-0 left-0 right-0 z-50',
        'bg-white/80 backdrop-blur-3xl',
        'shadow-[0_-12px_32px_rgba(0,0,0,0.06)]',
        'rounded-t-3xl safe-area-pb'
      )}
    >
      <div className="max-w-lg mx-auto flex items-center justify-around px-4 pb-2 pt-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center transition-all duration-200',
                'min-w-[64px] min-h-[48px] active:scale-90',
                isActive
                  ? 'bg-primary text-on-primary rounded-2xl px-5 py-2 scale-105 shadow-lg shadow-primary/20'
                  : 'text-on-surface-variant/70 hover:text-on-surface px-3 py-2'
              )}
            >
              <Icon
                name={item.icon}
                filled={isActive}
                weight={isActive ? 600 : 400}
                className="text-2xl mb-0.5"
              />
              <span
                className={cn(
                  'text-[10px] font-bold tracking-wide',
                  isActive ? 'text-on-primary' : 'text-on-surface-variant/70'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
