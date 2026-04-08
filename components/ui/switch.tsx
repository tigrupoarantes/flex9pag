'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

/**
 * Switch Apple-style — pílula que desliza entre cinza (off) e azul (on).
 * Implementação minimal sem Radix porque é a única coisa que precisa
 * disso e o app já tem componentes shadcn/base-ui suficientes.
 */
export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  className,
  id,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer rounded-full',
        'transition-colors duration-200 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-success' : 'bg-border-strong',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none inline-block size-[27px] transform rounded-full bg-white shadow-md',
          'transition duration-200 ease-in-out',
          'mt-[2px]',
          checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
        )}
      />
    </button>
  )
}
