'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface MarcarDasPagoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Recebe data (YYYY-MM-DD) e URL de comprovante (opcional). */
  onConfirm: (data: { paid_at: string; receipt_url: string | null }) => void
  loading?: boolean
  competenceLabel?: string
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function MarcarDasPagoDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  competenceLabel,
}: MarcarDasPagoDialogProps) {
  const [paidAt, setPaidAt] = useState(todayISO())
  const [receiptUrl, setReceiptUrl] = useState('')

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      setPaidAt(todayISO())
      setReceiptUrl('')
    }
  }, [open])

  function handleConfirm() {
    onConfirm({
      paid_at: paidAt,
      receipt_url: receiptUrl.trim() || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">
            Confirmar pagamento{competenceLabel ? ` — ${competenceLabel}` : ''}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Os campos abaixo são opcionais. Se quiser, anote a data exata do pagamento e o link do comprovante.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="paid_at">Data do pagamento</Label>
            <Input
              id="paid_at"
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className="h-12 text-base"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt_url">Link do comprovante (opcional)</Label>
            <Input
              id="receipt_url"
              type="url"
              placeholder="https://..."
              value={receiptUrl}
              onChange={(e) => setReceiptUrl(e.target.value)}
              className="h-12 text-base"
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="h-12"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="h-12 font-bold bg-secondary text-on-secondary hover:bg-secondary/90"
          >
            {loading ? 'Salvando...' : 'Confirmar pagamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
