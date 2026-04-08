'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Receipt,
  ChevronRight,
  CheckCircle2,
  HandCoins,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Service, PaymentMethod, ServiceStatus } from '@/lib/types'
import { formatCurrency, cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'
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
    initialDataUpdatedAt: Date.now(),
    staleTime: 1000 * 60 * 2,
  })

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
      setMarcarPagoOpen(false)
      setSelected(null)
      toast.success('Serviço marcado como pago!')
    },
    onError: () => toast.error('Erro ao salvar. Tente novamente.'),
  })

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
      setConfirmCancelOpen(false)
      setSelected(null)
      toast.success('Serviço cancelado.')
    },
    onError: () => toast.error('Erro ao cancelar. Tente novamente.'),
  })

  // ===== Empty state geral =====
  if (!services?.length) {
    return (
      <>
        <PageHeader title="Serviços" />
        <div className="flex flex-col items-center text-center py-20">
          <div className="size-14 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Receipt className="size-7 text-muted-foreground" strokeWidth={1.75} />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Nenhum serviço ainda
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Comece registrando o primeiro serviço para acompanhar seus recebimentos.
          </p>
          <Link
            href="/servicos/novo"
            className="inline-flex items-center gap-1.5 h-11 px-5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-95 transition-all"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Registrar serviço
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Serviços"
        subtitle="Tudo que você anotou."
        action={
          <Link
            href="/servicos/novo"
            className="hidden sm:inline-flex items-center gap-1.5 h-10 px-4 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-95 transition-all"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Novo serviço
          </Link>
        }
      />

      {/* Search + filtros */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary border-0 rounded-md h-10 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                statusFilter === f.value
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
          <select
            value={monthFilter}
            onChange={(e) =>
              setMonthFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="ml-auto bg-secondary border-0 rounded-full px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
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
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum serviço encontrado.
          </p>
        </div>
      ) : (
        <ul className="border-t border-border">
          {filtered.map((service) => {
            const isPending = service.status === 'pending'
            const isCancelled = service.status === 'cancelled'
            return (
              <li key={service.id} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setSelected(service)}
                  className="w-full flex items-center justify-between gap-4 py-4 text-left hover:bg-secondary/40 -mx-2 px-2 rounded-md transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-base font-semibold text-foreground truncate',
                        isCancelled && 'line-through text-muted-foreground'
                      )}
                    >
                      {service.description}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {service.clients?.name || service.client_name_snapshot || 'Sem cliente'}
                      {' · '}
                      {new Date(service.service_date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <p
                        className={cn(
                          'text-base font-semibold tabular-nums',
                          service.status === 'paid'
                            ? 'text-success'
                            : isCancelled
                              ? 'text-muted-foreground line-through'
                              : 'text-foreground'
                        )}
                      >
                        {formatCurrency(service.amount)}
                      </p>
                      {isPending && (
                        <p className="text-[11px] font-semibold text-warning">
                          Pendente
                        </p>
                      )}
                    </div>
                    <ChevronRight
                      className="size-4 text-muted-foreground"
                      strokeWidth={2}
                    />
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* Footer count */}
      {filtered.length > 0 && (
        <p className="text-center text-xs text-muted-foreground mt-6">
          {filtered.length} de {services.length} serviços
        </p>
      )}

      {/* FAB mobile */}
      <Link
        href="/servicos/novo"
        className="sm:hidden fixed bottom-20 right-5 z-40 size-14 bg-primary text-white rounded-full shadow-lg shadow-primary/25 flex items-center justify-center active:scale-90 transition-transform"
        aria-label="Novo serviço"
      >
        <Plus className="size-6" strokeWidth={2.5} />
      </Link>

      {/* Sheet detalhe */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="bottom" className="h-auto rounded-t-3xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="text-left pb-2">
                <SheetTitle className="text-xl font-semibold tracking-tight">
                  {selected.description}
                </SheetTitle>
                <p className="text-4xl font-bold tabular-nums tracking-tight text-foreground">
                  {formatCurrency(selected.amount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selected.service_date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </SheetHeader>

              {(selected.clients?.name || selected.client_name_snapshot) && (
                <div className="py-3 mt-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Cliente</p>
                  <p className="text-base font-medium text-foreground">
                    {selected.clients?.name || selected.client_name_snapshot}
                  </p>
                </div>
              )}

              <div className="hairline my-4" />

              <div className="space-y-2 pb-4">
                {selected.status === 'pending' && (
                  <>
                    <Button
                      className="w-full h-12 text-base font-semibold gap-2 bg-primary hover:bg-primary-hover"
                      onClick={() => setMarcarPagoOpen(true)}
                    >
                      <CheckCircle2 className="size-5" strokeWidth={2.5} />
                      Marcar como pago
                    </Button>
                    <Link
                      href={`/cobrar?service_id=${selected.id}&amount=${selected.amount}&description=${encodeURIComponent(selected.description)}`}
                      className="flex w-full h-12 items-center justify-center gap-2 text-base font-semibold rounded-md text-primary hover:bg-secondary transition-colors"
                    >
                      <HandCoins className="size-5" strokeWidth={2} />
                      Cobrar via link
                    </Link>
                  </>
                )}

                {selected.status === 'paid' && !selected.nfse_id && (
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base font-medium gap-2"
                    disabled
                  >
                    <Receipt className="size-5" strokeWidth={2} />
                    Emitir nota fiscal (em breve)
                  </Button>
                )}

                {selected.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => setConfirmCancelOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-destructive py-3 font-medium transition-colors"
                  >
                    <X className="size-4" strokeWidth={2} />
                    Cancelar este serviço
                  </button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal: marcar como pago */}
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
            <AlertDialogTitle>Cancelar este serviço?</AlertDialogTitle>
            <AlertDialogDescription>
              Não dá pra desfazer. O serviço fica cancelado e não conta no seu faturamento.
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
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {cancelService.isPending ? 'Cancelando...' : 'Sim, cancelar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
