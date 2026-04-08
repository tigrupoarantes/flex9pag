import Link from 'next/link'
import { Icon, type IconName } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

interface QuickActionCardProps {
  href: string
  title: string
  description: string
  icon: IconName
  variant?: 'primary' | 'secondary'
}

export function QuickActionCard({
  href,
  title,
  description,
  icon,
  variant = 'primary',
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'bg-surface-container-low hover:bg-surface-container-high active:scale-[0.98]',
        'p-5 lg:p-6 rounded-3xl transition-all duration-200 group',
        'flex items-center gap-4 lg:gap-5 text-left min-h-[80px]'
      )}
    >
      <div
        className={cn(
          'w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shrink-0',
          'group-hover:scale-110 transition-transform shadow-md',
          variant === 'primary'
            ? 'bg-primary text-on-primary'
            : 'bg-secondary text-on-secondary'
        )}
      >
        <Icon name={icon} filled className="text-2xl lg:text-3xl" />
      </div>
      <div className="min-w-0">
        <span className="block font-headline font-bold text-base lg:text-lg text-on-surface leading-tight">
          {title}
        </span>
        <span className="text-xs lg:text-sm text-on-surface-variant mt-0.5 block">
          {description}
        </span>
      </div>
    </Link>
  )
}
