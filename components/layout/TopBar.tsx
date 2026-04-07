import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TopBarProps {
  title: string
  action?: ReactNode
  className?: string
}

export function TopBar({ title, action, className }: TopBarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between',
        className
      )}
    >
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      {action && <div>{action}</div>}
    </header>
  )
}
