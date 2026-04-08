import { ReactNode } from 'react'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

interface TopBarProps {
  /** Título exibido no centro/esquerda. Opcional — quando ausente, mostra só a logo flex9pag. */
  title?: string
  /** Subtítulo abaixo do título (mobile). */
  subtitle?: string
  /** Slot à direita — botão custom, link, etc. */
  action?: ReactNode
  /** Iniciais do usuário para o avatar. */
  userInitial?: string
  className?: string
}

export function TopBar({ title, subtitle, action, userInitial, className }: TopBarProps) {
  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-40',
        'bg-white/70 backdrop-blur-2xl',
        'shadow-sm border-b border-outline-variant/20',
        className
      )}
    >
      <div className="flex items-center justify-between px-4 lg:px-8 py-3 lg:pl-72">
        {/* Lado esquerdo */}
        <div className="flex items-center gap-3 min-w-0">
          {userInitial ? (
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-base shrink-0">
              {userInitial}
            </div>
          ) : null}
          <div className="min-w-0">
            {title ? (
              <h1 className="font-headline font-extrabold text-base lg:text-xl text-on-surface tracking-tight leading-tight truncate">
                {title}
              </h1>
            ) : (
              <h1 className="font-headline font-extrabold text-xl text-primary tracking-tight">
                flex9pag
              </h1>
            )}
            {subtitle ? (
              <p className="text-xs text-on-surface-variant font-medium truncate">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        {/* Lado direito */}
        <div className="flex items-center gap-1">
          {action}
          <button
            type="button"
            className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors active:scale-95 hidden md:inline-flex"
            aria-label="Notificações"
          >
            <Icon name="notifications" />
          </button>
          <button
            type="button"
            className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors active:scale-95 hidden md:inline-flex"
            aria-label="Ajuda"
          >
            <Icon name="help" />
          </button>
        </div>
      </div>
    </header>
  )
}
