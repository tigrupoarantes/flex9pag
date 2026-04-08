'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Icon, type IconName } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/lib/types'

interface MarcarPagoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Chamada quando o usuário confirma — recebe o método selecionado. */
  onConfirm: (method: PaymentMethod) => void
  /** True enquanto a mutation está rolando — desabilita botões. */
  loading?: boolean
}

interface MethodOption {
  value: PaymentMethod
  label: string
  description: string
  icon: IconName
}

const METHODS: MethodOption[] = [
  { value: 'pix', label: 'Pix', description: 'Recebido na conta', icon: 'qr_code_2' },
  { value: 'cash', label: 'Dinheiro', description: 'Em espécie', icon: 'payments' },
  { value: 'credit_card', label: 'Cartão', description: 'Crédito ou débito', icon: 'badge' },
  { value: 'transfer', label: 'Transferência', description: 'TED ou DOC', icon: 'account_balance' },
  { value: 'boleto', label: 'Boleto', description: 'Pago no banco', icon: 'receipt_long' },
  { value: 'other', label: 'Outro', description: 'Outra forma', icon: 'more_horiz' },
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
          <DialogTitle className="font-headline text-xl">Como você recebeu?</DialogTitle>
          <DialogDescription className="text-sm">
            Escolha a forma de pagamento para registrar este recebimento.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          {METHODS.map((m) => {
            const isSelected = selected === m.value
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setSelected(m.value)}
                disabled={loading}
                className={cn(
                  'flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all',
                  'border-2 active:scale-[0.98]',
                  isSelected
                    ? 'border-primary bg-primary-fixed'
                    : 'border-outline-variant/40 bg-surface-container-low hover:border-outline-variant'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    isSelected
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-high text-on-surface-variant'
                  )}
                >
                  <Icon name={m.icon} filled={isSelected} />
                </div>
                <div>
                  <p
                    className={cn(
                      'font-bold text-sm',
                      isSelected ? 'text-primary' : 'text-on-surface'
                    )}
                  >
                    {m.label}
                  </p>
                  <p className="text-xs text-on-surface-variant">{m.description}</p>
                </div>
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
            className="h-12"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selected || loading}
            className="h-12 font-bold"
          >
            {loading ? 'Salvando...' : 'Confirmar pagamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
