'use client'

import { useState } from 'react'
import {
  QrCode,
  Banknote,
  CreditCard,
  Landmark,
  Receipt,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/lib/types'

interface MarcarPagoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (method: PaymentMethod) => void
  loading?: boolean
}

interface MethodOption {
  value: PaymentMethod
  label: string
  Icon: LucideIcon
}

const METHODS: MethodOption[] = [
  { value: 'pix', label: 'Pix', Icon: QrCode },
  { value: 'cash', label: 'Dinheiro', Icon: Banknote },
  { value: 'credit_card', label: 'Cartão', Icon: CreditCard },
  { value: 'transfer', label: 'Transferência', Icon: Landmark },
  { value: 'boleto', label: 'Boleto', Icon: Receipt },
  { value: 'other', label: 'Outro', Icon: MoreHorizontal },
]

export function MarcarPagoDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: MarcarPagoDialogProps) {
  const [selected, setSelected] = useState<PaymentMethod | null>(null)

  function handleConfirm() {
    if (!selected) return
    onConfirm(selected)
  }

  function handleOpenChange(next: boolean) {
    if (!next) setSelected(null)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Como você recebeu?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Escolha a forma de pagamento.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 py-4">
          {METHODS.map((m) => {
            const isSelected = selected === m.value
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setSelected(m.value)}
                disabled={loading}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-lg text-left transition-all',
                  'border active:scale-[0.98]',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-secondary hover:border-border-strong'
                )}
              >
                <m.Icon
                  className={cn(
                    'size-5',
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  )}
                  strokeWidth={2}
                />
                <span
                  className={cn(
                    'text-sm font-semibold',
                    isSelected ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {m.label}
                </span>
              </button>
            )
          })}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
            className="h-11"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selected || loading}
            className="h-11 bg-primary hover:bg-primary-hover font-semibold"
          >
            {loading ? 'Salvando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
