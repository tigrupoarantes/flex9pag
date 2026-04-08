'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { DasPayment } from '@/lib/types'
import { formatCurrency, formatMonthYear, cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'
import { DasEmptyState } from './DasEmptyState'
import { MarcarDasPagoDialog } from './MarcarDasPagoDialog'

interface DasListProps {
  das: DasPayment[]
  userId: string
  year: number
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function DasList({ das, userId, year }: DasListProps) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const router = useRouter()
  const [selected, setSelected] = useState<DasPayment | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const nextDue = useMemo(() => {
    return das
      .filter((d) => d.status === 'pending')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]
  }, [das])

  const paidCount = das.filter((d) => d.status === 'paid').length

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
      router.refresh()
    },
    onError: () => toast.error('Erro ao salvar. Tente novamente.'),
  })

  function handleOpenMark(d: DasPayment) {
    setSelected(d)
    setDialogOpen(true)
  }

  if (das.length === 0) {
    return (
      <>
        <PageHeader
          title={`DAS ${year}`}
          subtitle="Mantenha suas obrigações em dia."
        />
        <DasEmptyState userId={userId} year={year} />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={`DAS ${year}`}
        subtitle={`${paidCount} de ${das.length} guias pagas.`}
      />

      {/* Próximo vencimento — só se houver pendente */}
      {nextDue && (
        <section className="mb-8">
          <p className="text-sm text-muted-foreground">Próximo vencimento</p>
          <p className="text-3xl font-bold tabular-nums tracking-tight mt-1">
            {formatCurrency(nextDue.amount ?? 75.6)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(nextDue.due_date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
            })}
          </p>
        </section>
      )}

      {/* Lista vertical de meses */}
      <ul className="border-t border-border">
        {das.map((item) => {
          const monthIdx = new Date(item.competence_month).getMonth()
          const monthLabel = MONTHS[monthIdx]
          const dueLabel = new Date(item.due_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
          })
          const amount = item.amount ?? 75.6

          const isPaid = item.status === 'paid'
          const isOverdue = item.status === 'overdue'

          return (
            <li key={item.id} className="border-b border-border">
              <button
                type="button"
                onClick={() => !isPaid && handleOpenMark(item)}
                disabled={isPaid}
                className={cn(
                  'w-full flex items-center justify-between gap-4 py-4 -mx-2 px-2 rounded-md text-left transition-colors',
                  !isPaid && 'hover:bg-secondary/40 cursor-pointer'
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      'shrink-0 size-10 rounded-full flex items-center justify-center',
                      isPaid && 'bg-success/10',
                      isOverdue && 'bg-destructive/10',
                      !isPaid && !isOverdue && 'bg-secondary'
                    )}
                  >
                    {isPaid ? (
                      <CheckCircle2
                        className="size-5 text-success"
                        strokeWidth={2.5}
                      />
                    ) : isOverdue ? (
                      <AlertTriangle
                        className="size-5 text-destructive"
                        strokeWidth={2.25}
                      />
                    ) : (
                      <Clock
                        className="size-5 text-muted-foreground"
                        strokeWidth={2}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-foreground">
                      {monthLabel}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isPaid && item.paid_at
                        ? `Pago em ${new Date(item.paid_at).toLocaleDateString('pt-BR')}`
                        : isOverdue
                          ? `Venceu ${dueLabel}`
                          : `Vence ${dueLabel}`}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={cn(
                      'text-base font-semibold tabular-nums',
                      isPaid
                        ? 'text-success'
                        : isOverdue
                          ? 'text-destructive'
                          : 'text-foreground'
                    )}
                  >
                    {formatCurrency(amount)}
                  </p>
                  {!isPaid && (
                    <p
                      className={cn(
                        'text-[11px] font-semibold uppercase tracking-wide',
                        isOverdue ? 'text-destructive' : 'text-warning'
                      )}
                    >
                      {isOverdue ? 'Vencido' : 'Pendente'}
                    </p>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      {/* Como pagar — minimalista */}
      <section className="mt-12 pt-8 border-t border-border">
        <h2 className="text-xl font-semibold tracking-tight mb-4">
          Como pagar o DAS
        </h2>
        <ol className="space-y-2 text-sm text-muted-foreground mb-6">
          <li className="flex gap-3">
            <span className="text-foreground font-semibold shrink-0">1.</span>
            <span>Entre no app PGMEI ou em gov.br/mei</span>
          </li>
          <li className="flex gap-3">
            <span className="text-foreground font-semibold shrink-0">2.</span>
            <span>Gere o boleto ou copie o código Pix</span>
          </li>
          <li className="flex gap-3">
            <span className="text-foreground font-semibold shrink-0">3.</span>
            <span>Pague pelo app do seu banco</span>
          </li>
          <li className="flex gap-3">
            <span className="text-foreground font-semibold shrink-0">4.</span>
            <span>Volte aqui e marque como pago</span>
          </li>
        </ol>
        <a
          href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          Acessar gov.br/mei
          <ExternalLink className="size-4" strokeWidth={2} />
        </a>

        <div className="mt-8 flex items-start gap-3 p-4 rounded-xl bg-secondary">
          <ShieldCheck
            className="size-5 text-foreground shrink-0 mt-0.5"
            strokeWidth={2}
          />
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-0.5">
              Cuidado com golpes
            </p>
            O DAS é emitido só pelo portal do governo. Desconfie de boletos
            enviados por WhatsApp, SMS ou e-mail.
          </div>
        </div>
      </section>

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
    </>
  )
}
