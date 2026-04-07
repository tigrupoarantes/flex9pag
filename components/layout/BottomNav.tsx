'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, List, PlusCircle, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/inicio', label: 'Início', icon: Home },
  { href: '/servicos', label: 'Serviços', icon: List },
  { href: '/cobrar', label: 'Cobrar', icon: PlusCircle },
  { href: '/configuracoes', label: 'Mais', icon: MoreHorizontal },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors min-w-[64px]',
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon
                className={cn('h-6 w-6', isActive && 'text-blue-600')}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={cn('text-xs font-medium', isActive && 'font-semibold')}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
