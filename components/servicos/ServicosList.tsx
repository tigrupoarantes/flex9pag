'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Service, PaymentMethod, ServiceStatus } from '@/lib/types'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { getServiceIcon } from '@/lib/service-icons'
import { Icon } from '@/components/ui/icon'
import { StatusBadge } from './StatusBadge'
import { MarcarPagoDialog } from './MarcarPagoDialog'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'

interface ServicosListProps {
  initialServices: Service[]
}

type StatusFilter = 'all' | ServiceStatus

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendente' },
  { value: 'paid', label: 'Pago' },
  { value: 'cancelled', label: 'Cancelado' },
]

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function ServicosList({ initialServices }: ServicosListProps) {
  const [selected, setSelected] = useState<Service | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [monthFilter, setMonthFilter] = useState<number | 'all'>('all')
  const [search, setSearch] = useState('')
  const [marcarPagoOpen, setMarcarPagoOpen] = useState(false)
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)

  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*, clients(id, name)')
        .order('service_date', { ascending: false })
        .limit(100)
      if (error) throw error
      return data as Service[]
    },
    initialData: initialServices,
    // Sem isto, initialData é tratada como stale e dispara um refetch
    // imediato no mount — duplicando a query do Server Component.
    initialDataUpdatedAt: Date.now(),
    staleTime: 1000 * 60 * 2,
  })

  // Filtros aplicados
  const filtered = useMemo(() => {
    return (services ?? []).filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (monthFilter !== 'all') {
        const m = new Date(s.service_date).getMonth()
        if (m !== monthFilter) return false
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim()
        const inDesc = s.description.toLowerCase().includes(q)
        const inClient =
          (s.clients?.name?.toLowerCase().includes(q) ?? false) ||
          (s.client_name_snapshot?.toLowerCase().includes(q) ?? false)
        if (!inDesc && !inClient) return false
      }
      return true
    })
  }, [services, statusFilter, monthFilter, search])

  // Mutation: marcar como pago (com método)
  const markPaid = useMutation({
    mutationFn: async ({ id, method }: { id: string; method: PaymentMethod }) => {
      const { error } = await supabase
        .from('services')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_method: method,
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setMarcarPagoOpen(false)
      setSelected(null)
      toast.success('Serviço marcado como pago!')
    },
    onError: () => toast.error('Erro ao salvar. Tente novamente.'),
  })

  // Mutation: cancelar serviço
  const cancelService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('services')
        .update({ status: 'cancelled' })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setConfirmCancelOpen(false)
      setSelected(null)
      toast.success('Serviço cancelado.')
    },
    onError: () => toast.error('Erro ao cancelar. Tente novamente.'),
  })

  // Empty state — sem nenhum serviço cadastrado
  if (!services?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-surface-container-low rounded-3xl">
        <div className="w-16 h-16 bg-primary-fixed rounded-2xl flex items-center justify-center mb-4">
          <Icon name="receipt_long" className="text-3xl text-primary" />
        </div>
        <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
          Nenhum serviço ainda
        </h3>
        <p className="text-sm text-on-surface-variant mb-6 max-w-xs">
          Comece registrando o primeiro serviço para acompanhar seus recebimentos.
        </p>
        <Link
          href="/servicos/novo"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold active:scale-95 transition-transform"
        >
          <Icon name="add" />
          Registrar serviço
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-2xl lg:text-4xl text-on-surface tracking-tight">
            Meus serviços
          </h1>
          <p className="text-on-surface-variant text-sm lg:text-base mt-1">
            Acompanhe seus recebimentos e cobranças.
          </p>
        </div>
        <Link
          href="/servicos/novo"
          className="hidden lg:inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold shadow-xl shadow-primary/10 active:scale-95 transition-all"
        >
          <Icon name="add" />
          Novo serviço
        </Link>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Icon
            name="search"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar por descrição ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 text-base text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Status chips */}
          <div className="flex items-center p-1 bg-surface-container rounded-2xl gap-1 overflow-x-auto">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  'px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all',
                  statusFilter === f.value
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Month select */}
          <select
            value={monthFilter}
            onChange={(e) =>
              setMonthFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="bg-surface-container border-none rounded-2xl px-4 py-3 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            <option value="all">Todos os meses</option>
            {MONTHS.map((label, idx) => (
              <option key={label} value={idx}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista filtrada */}
      {filtered.length === 0 ? (
        <div className="bg-surface-container-low rounded-3xl p-12 text-center">
          <Icon name="search" className="text-4xl text-outline mb-2" />
          <p className="text-on-surface-variant text-sm">
            Nenhum serviço encontrado com esses filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((service) => {
            const iconName = getServiceIcon(service.description)
            const cardBg =
              service.status === 'paid'
                ? 'bg-secondary-container'
                : service.status === 'pending'
                ? 'bg-primary-fixed'
                : 'bg-surface-container-high'
            const cardText =
              service.status === 'paid'
                ? 'text-on-secondary-container'
                : service.status === 'pending'
                ? 'text-on-primary-fixed-variant'
                : 'text-on-surface-variant'
            return (
              <button
                key={service.id}
                onClick={() => setSelected(service)}
                className="group bg-surface-container-lowest hover:bg-surface-container-low transition-colors p-4 lg:p-6 rounded-2xl flex items-start lg:items-center justify-between gap-4 shadow-sm border border-outline-variant/20 text-left active:scale-[0.99]"
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div
                    className={cn(
                      'w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shrink-0',
                      cardBg,
                      cardText
                    )}
                  >
                    <Icon name={iconName} className="text-2xl lg:text-3xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base lg:text-lg text-on-surface leading-tight truncate">
                      {service.description}
                    </h3>
                    <p className="text-on-surface-variant text-xs lg:text-sm mt-0.5 truncate">
                      {service.clients?.name || service.client_name_snapshot || 'Sem cliente'}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-outline">
                      <Icon name="calendar_today" className="text-sm" />
                      <span>{formatDate(service.service_date)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="font-headline font-extrabold text-lg lg:text-xl text-on-surface tracking-tight">
                    {formatCurrency(service.amount)}
                  </p>
                  <StatusBadge status={service.status} />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Footer count */}
      {filtered.length > 0 && (
        <p className="text-center text-xs text-outline">
          Exibindo {filtered.length} de {services.length} serviços
        </p>
      )}

      {/* FAB mobile */}
      <Link
        href="/servicos/novo"
        className="lg:hidden fixed bottom-28 right-6 z-40 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform"
        aria-label="Novo serviço"
      >
        <Icon name="add" className="text-3xl" />
      </Link>

      {/* Sheet detalhe */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="bottom" className="h-auto rounded-t-3xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="text-left pb-2">
                <SheetTitle className="font-headline text-xl text-on-surface">
                  {selected.description}
                </SheetTitle>
                <p className="font-headline text-4xl font-extrabold text-on-surface tracking-tighter">
                  {formatCurrency(selected.amount)}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <StatusBadge status={selected.status} size="md" />
                  <span className="text-sm text-on-surface-variant">
                    {formatDate(selected.service_date)}
                  </span>
                </div>
              </SheetHeader>

              {(selected.clients?.name || selected.client_name_snapshot) && (
                <div className="flex items-center gap-3 py-3 px-3 mt-2 bg-surface-container-low rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
                    <Icon name="person" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-on-surface-variant">Cliente</p>
                    <p className="font-bold text-on-surface text-sm truncate">
                      {selected.clients?.name || selected.client_name_snapshot}
                    </p>
                  </div>
                </div>
              )}

              <Separator className="my-4 bg-outline-variant/40" />

              <div className="space-y-3 pb-4">
                {selected.status === 'pending' && (
                  <>
                    <Button
                      className="w-full h-12 text-base font-bold gap-2 bg-primary hover:bg-primary-container"
                      onClick={() => setMarcarPagoOpen(true)}
                    >
                      <Icon name="check_circle" filled />
                      Marcar como pago
                    </Button>
                    <Link
                      href={`/cobrar?service_id=${selected.id}&amount=${selected.amount}&description=${encodeURIComponent(selected.description)}`}
                      className="flex w-full h-12 items-center justify-center gap-2 text-base font-bold rounded-md border-2 border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors active:scale-[0.98]"
                    >
                      <Icon name="send_money" />
                      Cobrar via link
                    </Link>
                  </>
                )}

                {selected.status === 'paid' && !selected.nfse_id && (
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base font-bold gap-2 border-2"
                    disabled
                  >
                    <Icon name="receipt_long" />
                    Emitir nota fiscal (em breve)
                  </Button>
                )}

                {selected.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => setConfirmCancelOpen(true)}
                    className="w-full text-center text-sm text-on-surface-variant hover:text-on-surface py-3 font-medium"
                  >
                    Cancelar este serviço
                  </button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal: marcar como pago (método de pagamento) */}
      <MarcarPagoDialog
        open={marcarPagoOpen}
        onOpenChange={setMarcarPagoOpen}
        loading={markPaid.isPending}
        onConfirm={(method) => {
          if (selected) markPaid.mutate({ id: selected.id, method })
        }}
      />

      {/* AlertDialog: confirmar cancelamento */}
      <AlertDialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline">Cancelar este serviço?</AlertDialogTitle>
            <AlertDialogDescription>
              Não dá pra desfazer. O serviço fica marcado como cancelado e não conta no seu faturamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelService.isPending}>
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selected) cancelService.mutate(selected.id)
              }}
              disabled={cancelService.isPending}
              className="bg-error hover:bg-error/90 text-on-error"
            >
              {cancelService.isPending ? 'Cancelando...' : 'Sim, cancelar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
