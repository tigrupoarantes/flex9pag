'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { IMaskInput } from 'react-imask'
import { createClient } from '@/lib/supabase/client'
import type { Plan } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface EditPlanoSheetProps {
  plan: Plan | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FeatureFlag {
  key: string
  label: string
}

const FEATURE_FLAGS: FeatureFlag[] = [
  { key: 'payment_links', label: 'Links de pagamento' },
  { key: 'nfse', label: 'Notas fiscais (NFS-e)' },
  { key: 'das', label: 'Controle de DAS' },
  { key: 'reports', label: 'Relatórios' },
]

function priceToString(price: number): string {
  return price.toFixed(2).replace('.', ',')
}

function stringToPrice(s: string): number {
  // "1.234,56" → 1234.56 ; "59,90" → 59.90
  const cleaned = s.replace(/\./g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

export function EditPlanoSheet({ plan, open, onOpenChange }: EditPlanoSheetProps) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const router = useRouter()

  // Estado do form
  const [name, setName] = useState('')
  const [priceStr, setPriceStr] = useState('')
  const [maxNfseStr, setMaxNfseStr] = useState('')
  const [unlimitedNfse, setUnlimitedNfse] = useState(false)
  const [features, setFeatures] = useState<Record<string, boolean>>({})
  const [active, setActive] = useState(true)

  // Sincroniza form quando abrir o sheet
  useEffect(() => {
    if (!plan || !open) return
    setName(plan.name ?? '')
    setPriceStr(priceToString(plan.price_monthly ?? 0))
    setUnlimitedNfse(plan.max_nfse_per_month === null)
    setMaxNfseStr(plan.max_nfse_per_month?.toString() ?? '')
    setActive(plan.active ?? true)

    // Garante que todas as 4 keys existem (default false se não estiverem no JSON)
    const f: Record<string, boolean> = {}
    for (const flag of FEATURE_FLAGS) {
      f[flag.key] = !!plan.features?.[flag.key]
    }
    setFeatures(f)
  }, [plan, open])

  const updatePlan = useMutation({
    mutationFn: async () => {
      if (!plan) throw new Error('Sem plano selecionado')

      const trimmedName = name.trim()
      if (!trimmedName) throw new Error('Nome obrigatório')

      const price = stringToPrice(priceStr)
      if (price < 0) throw new Error('Preço inválido')

      const maxNfse = unlimitedNfse
        ? null
        : maxNfseStr.trim()
          ? parseInt(maxNfseStr, 10)
          : null

      const { error } = await supabase
        .from('plans')
        .update({
          name: trimmedName,
          price_monthly: price,
          max_nfse_per_month: maxNfse,
          features,
          active,
        })
        .eq('id', plan.id)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Plano salvo!')
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      onOpenChange(false)
      router.refresh()
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao salvar. Tente novamente.')
    },
  })

  function toggleFeature(key: string) {
    setFeatures((f) => ({ ...f, [key]: !f[key] }))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl max-h-[92vh] overflow-y-auto sm:max-w-lg sm:mx-auto"
      >
        <SheetHeader className="text-left mb-4">
          <SheetTitle className="text-xl font-semibold tracking-tight">
            Editar plano
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Mudanças entram em vigor para novos assinantes imediatamente.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="plan-name" className="text-sm font-medium">
              Nome do plano
            </Label>
            <Input
              id="plan-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pro"
              className="h-12 text-base bg-secondary border-0"
              disabled={updatePlan.isPending}
            />
          </div>

          {/* Preço mensal */}
          <div className="space-y-1.5">
            <Label htmlFor="plan-price" className="text-sm font-medium">
              Preço mensal
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground pointer-events-none">
                R$
              </span>
              <IMaskInput
                id="plan-price"
                mask={Number}
                scale={2}
                radix=","
                thousandsSeparator="."
                padFractionalZeros={true}
                normalizeZeros={true}
                value={priceStr}
                onAccept={(value: string) => setPriceStr(value)}
                placeholder="0,00"
                disabled={updatePlan.isPending}
                className={cn(
                  'flex h-12 w-full rounded-md bg-secondary border-0 pl-11 pr-4 text-base',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              />
            </div>
          </div>

          {/* NFS-e por mês + Switch ilimitado */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="plan-unlimited" className="text-sm font-medium">
                NFS-e ilimitada
              </Label>
              <Switch
                id="plan-unlimited"
                checked={unlimitedNfse}
                onCheckedChange={setUnlimitedNfse}
                disabled={updatePlan.isPending}
              />
            </div>
            {!unlimitedNfse && (
              <div className="space-y-1.5">
                <Label htmlFor="plan-max-nfse" className="text-sm font-medium">
                  Máximo de NFS-e por mês
                </Label>
                <Input
                  id="plan-max-nfse"
                  type="number"
                  min={0}
                  value={maxNfseStr}
                  onChange={(e) => setMaxNfseStr(e.target.value)}
                  placeholder="0"
                  className="h-12 text-base bg-secondary border-0"
                  disabled={updatePlan.isPending}
                />
              </div>
            )}
          </div>

          {/* Recursos inclusos */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Recursos inclusos</Label>
            <div className="space-y-1 rounded-xl border border-border overflow-hidden">
              {FEATURE_FLAGS.map((flag, idx) => (
                <div
                  key={flag.key}
                  className={cn(
                    'flex items-center justify-between px-4 py-3',
                    idx < FEATURE_FLAGS.length - 1 && 'border-b border-border'
                  )}
                >
                  <Label
                    htmlFor={`plan-feat-${flag.key}`}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {flag.label}
                  </Label>
                  <Switch
                    id={`plan-feat-${flag.key}`}
                    checked={features[flag.key] ?? false}
                    onCheckedChange={() => toggleFeature(flag.key)}
                    disabled={updatePlan.isPending}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Plano ativo */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <Label htmlFor="plan-active" className="text-sm font-medium">
                Plano ativo
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Quando inativo, não aparece para novos assinantes.
              </p>
            </div>
            <Switch
              id="plan-active"
              checked={active}
              onCheckedChange={setActive}
              disabled={updatePlan.isPending}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 mt-8 pb-4">
          <Button
            type="button"
            onClick={() => updatePlan.mutate()}
            disabled={updatePlan.isPending || !name.trim()}
            className="h-12 text-base font-semibold bg-primary hover:bg-primary-hover"
          >
            {updatePlan.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={updatePlan.isPending}
            className="h-12 text-base font-medium"
          >
            Cancelar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
