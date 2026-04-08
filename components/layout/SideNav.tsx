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
  { href: '/inicio', label: 'Início', icon: 'dashboard' },
  { href: '/servicos', label: 'Serviços', icon: 'receipt_long' },
  { href: '/clientes', label: 'Clientes', icon: 'group' },
  { href: '/das', label: 'DAS', icon: 'history_edu' },
  { href: '/configuracoes', label: 'Configurações', icon: 'settings' },
]

export function SideNav() {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col gap-4 p-4',
        'fixed left-0 top-0 h-screen w-64 z-30',
        'bg-surface-container-low border-r border-outline-variant/30',
        'pt-20' // espaço para o TopBar fixo
      )}
    >
      <div className="px-4 py-4 mb-2">
        <h2 className="font-headline font-extrabold text-xl text-primary tracking-tight">
          flex9pag
        </h2>
        <p className="text-xs text-on-surface-variant mt-1">Gestão MEI</p>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm',
                isActive
                  ? 'bg-primary-fixed text-primary font-bold border-r-4 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high font-medium'
              )}
            >
              <Icon name={item.icon} filled={isActive} weight={isActive ? 600 : 400} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4">
        <Link
          href="/cobrar"
          className={cn(
            'w-full bg-primary text-on-primary py-4 rounded-xl font-bold',
            'flex items-center justify-center gap-2 shadow-lg shadow-primary/20',
            'hover:bg-primary-container active:scale-95 transition-all'
          )}
        >
          <Icon name="send_money" filled />
          Cobrar cliente
        </Link>
      </div>
    </aside>
  )
}
