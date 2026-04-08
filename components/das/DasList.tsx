'use client'

import { useState, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { DasPayment } from '@/lib/types'
import { formatCurrency, formatMonthYear } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'
import { DasMonthCard } from './DasMonthCard'
import { DasEmptyState } from './DasEmptyState'
import { DasInstructions } from './DasInstructions'
import { MarcarDasPagoDialog } from './MarcarDasPagoDialog'

interface DasListProps {
  das: DasPayment[]
  userId: string
  year: number
}

const FAR_FUTURE_THRESHOLD_DAYS = 60

export function DasList({ das, userId, year }: DasListProps) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<DasPayment | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const now = new Date()
  const currentMonth = now.getMonth()

  const nextDue = useMemo(() => {
    return das
      .filter((d) => d.status === 'pending')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]
  }, [das])

  const markPaid = useMutation({
    mutationFn: async (payload: {
      id: string
      paid_at: string
      receipt_url: string | null
    }) => {
      const { error } = await supabase
        .from('das_payments')
        .update({
          status: 'paid',
          paid_at: payload.paid_at,
          receipt_url: payload.receipt_url,
        })
        .eq('id', payload.id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('DAS marcado como pago!')
      queryClient.invalidateQueries({ queryKey: ['das'] })
      setDialogOpen(false)
      setSelected(null)
      // Server component precisa re-fetch
      window.location.reload()
    },
    onError: () => toast.error('Erro ao salvar. Tente novamente.'),
  })

  function handleOpenMark(d: DasPayment) {
    setSelected(d)
    setDialogOpen(true)
  }

  // Empty state — usuário ainda não tem guias do ano
  if (das.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <header>
          <h1 className="font-headline font-extrabold text-2xl lg:text-4xl text-on-surface tracking-tight">
            Meu DAS {year}
          </h1>
          <p className="text-on-surface-variant text-sm lg:text-base mt-1 max-w-2xl">
            Mantenha suas obrigações em dia para garantir seus benefícios do INSS.
          </p>
        </header>
        <DasEmptyState userId={userId} year={year} />
        <DasInstructions />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      {/* Header com card "Próximo vencimento" */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-2xl lg:text-4xl text-on-surface tracking-tight">
            Meu DAS {year}
          </h1>
          <p className="text-on-surface-variant text-sm lg:text-base mt-1 max-w-xl">
            Mantenha suas obrigações em dia para garantir seus benefícios do INSS.
          </p>
        </div>
        {nextDue && (
          <div className="bg-surface-container-low p-5 rounded-2xl flex items-center gap-3 border-l-4 border-secondary shadow-sm">
            <div className="bg-secondary-container p-3 rounded-xl shrink-0">
              <Icon name="verified" filled className="text-secondary text-2xl" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-on-surface-variant">Próximo vencimento</p>
              <p className="font-bold text-base text-on-surface truncate">
                {new Date(nextDue.due_date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                })}
                {' · '}
                {formatCurrency(nextDue.amount ?? 75.6)}
              </p>
            </div>
          </div>
        )}
      </header>

      {/* Grid de 12 meses */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5">
        {das.map((item) => {
          const compMonth = new Date(item.competence_month).getMonth()
          const isCurrent = compMonth === currentMonth && item.status === 'pending'
          const dueIn = new Date(item.due_date).getTime() - now.getTime()
          const dueDays = dueIn / (1000 * 60 * 60 * 24)
          const isFarFuture = item.status === 'pending' && dueDays > FAR_FUTURE_THRESHOLD_DAYS
          return (
            <DasMonthCard
              key={item.id}
              das={item}
              isCurrent={isCurrent}
              isFarFuture={isFarFuture}
              onMarkPaid={handleOpenMark}
            />
          )
        })}
      </section>

      {/* Bento de instruções */}
      <DasInstructions />

      {/* Modal "Marcar como pago" */}
      <MarcarDasPagoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        loading={markPaid.isPending}
        competenceLabel={selected ? formatMonthYear(selected.competence_month) : undefined}
        onConfirm={(data) => {
          if (selected) {
            markPaid.mutate({
              id: selected.id,
              paid_at: data.paid_at,
              receipt_url: data.receipt_url,
            })
          }
        }}
      />
    </div>
  )
}
