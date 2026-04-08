import Link from 'next/link'
import {
  Plus,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { formatCurrency, getMeiLimitPercentage, MEI_ANNUAL_LIMIT, cn } from '@/lib/utils'
import type { DasPayment, ServiceStatus } from '@/lib/types'

interface RecentService {
  id: string
  description: string
  amount: number
  status: ServiceStatus
  service_date: string
  client_name_snapshot: string
}

interface DashboardContentProps {
  userName: string | null
  totalReceived: number
  totalPending: number
  prevMonthReceived: number
  annualRevenue: number
  pendingCount: number
  nextDas: Pick<DasPayment, 'competence_month' | 'due_date' | 'amount' | 'status'> | null
  recentServices: RecentService[]
}

const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000
const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function getDelta(current: number, previous: number) {
  if (previous === 0) return current > 0 ? { pct: 100, up: true } : null
  const pct = ((current - previous) / previous) * 100
  return { pct: Math.abs(pct), up: pct >= 0 }
}

export function DashboardContent({
  userName,
  totalReceived,
  totalPending,
  prevMonthReceived,
  annualRevenue,
  pendingCount,
  nextDas,
  recentServices,
}: DashboardContentProps) {
  const firstName = userName?.split(' ')[0] || 'amigo'
  const monthName = MONTH_NAMES[new Date().getMonth()]
  const delta = getDelta(totalReceived, prevMonthReceived)

  // Banner DAS — só renderiza se ≤ 10 dias
  const showDasAlert =
    nextDas && new Date(nextDas.due_date).getTime() - Date.now() <= TEN_DAYS_MS

  // Banner MEI — só se ≥ 80%
  const meiPct = getMeiLimitPercentage(annualRevenue)
  const showMeiAlert = meiPct >= 80
  const meiOver = annualRevenue >= MEI_ANNUAL_LIMIT

  // Calcula dias até DAS vencer
  let dasDays = 0
  if (showDasAlert && nextDas) {
    dasDays = Math.ceil(
      (new Date(nextDas.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  }

  return (
    <div className="flex flex-col gap-12">
      {/* ===== HERO: 1 número grande ===== */}
      <section>
        <p className="text-sm text-muted-foreground mb-2">
          {getGreeting()}, {firstName}
        </p>
        <h1 className="text-5xl lg:text-6xl font-bold tracking-tight tabular-nums leading-none">
          {formatCurrency(totalReceived)}
        </h1>
        <p className="text-base text-muted-foreground mt-3">
          recebido em {monthName}
        </p>

        {delta && (
          <div
            className={cn(
              'inline-flex items-center gap-1 mt-4 text-sm font-medium',
              delta.up ? 'text-success' : 'text-destructive'
            )}
          >
            {delta.up ? (
              <TrendingUp className="size-4" strokeWidth={2.25} />
            ) : (
              <TrendingDown className="size-4" strokeWidth={2.25} />
            )}
            <span>
              {delta.up ? '+' : '-'}{delta.pct.toFixed(0)}% vs mês passado
            </span>
          </div>
        )}
      </section>

      {/* ===== A receber ===== */}
      {totalPending > 0 && (
        <>
          <div className="hairline" />
          <section>
            <p className="text-sm text-muted-foreground mb-1">A receber</p>
            <p className="text-3xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(totalPending)}
            </p>
            <Link
              href="/servicos"
              className="inline-flex items-center gap-1 mt-2 text-sm text-primary font-medium hover:underline"
            >
              {pendingCount} {pendingCount === 1 ? 'serviço pendente' : 'serviços pendentes'}
              <ChevronRight className="size-4" strokeWidth={2.25} />
            </Link>
          </section>
        </>
      )}

      {/* ===== Alertas (1 por vez, na ordem de prioridade) ===== */}
      {(showDasAlert || showMeiAlert) && <div className="hairline" />}

      {showDasAlert && nextDas && (
        <section className="flex items-start gap-3">
          <div className="shrink-0 size-10 rounded-full bg-warning/10 flex items-center justify-center">
            <AlertTriangle
              className="size-5 text-warning"
              strokeWidth={2.25}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground">
              {dasDays <= 0
                ? `Seu DAS venceu`
                : dasDays === 1
                  ? 'Seu DAS vence amanhã'
                  : `Seu DAS vence em ${dasDays} dias`}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {formatCurrency(nextDas.amount ?? 75.6)} ·{' '}
              {new Date(nextDas.due_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
              })}
            </p>
            <Link
              href="/das"
              className="inline-flex items-center gap-1 mt-2 text-sm text-primary font-medium hover:underline"
            >
              Ver guia DAS
              <ChevronRight className="size-4" strokeWidth={2.25} />
            </Link>
          </div>
        </section>
      )}

      {showMeiAlert && (
        <section className="flex items-start gap-3">
          <div
            className={cn(
              'shrink-0 size-10 rounded-full flex items-center justify-center',
              meiOver
                ? 'bg-destructive/10'
                : 'bg-warning/10'
            )}
          >
            <AlertTriangle
              className={cn(
                'size-5',
                meiOver ? 'text-destructive' : 'text-warning'
              )}
              strokeWidth={2.25}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground">
              {meiOver
                ? 'Você ultrapassou o limite MEI'
                : `Você está em ${meiPct.toFixed(0)}% do limite MEI`}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {formatCurrency(annualRevenue)} faturados de{' '}
              {formatCurrency(MEI_ANNUAL_LIMIT)} no ano
            </p>
          </div>
        </section>
      )}

      {/* ===== CTA primário ===== */}
      <div className="hairline" />
      <section className="flex flex-col gap-3">
        <Link
          href="/servicos/novo"
          className={cn(
            'flex items-center justify-center gap-2 w-full h-14',
            'bg-primary text-white font-semibold text-base rounded-xl',
            'hover:bg-primary-hover active:scale-[0.98] transition-all'
          )}
        >
          <Plus className="size-5" strokeWidth={2.5} />
          Registrar serviço
        </Link>
        <Link
          href="/cobrar"
          className="flex items-center justify-center gap-1 w-full h-12 text-primary font-medium text-base hover:underline"
        >
          Cobrar cliente
          <ChevronRight className="size-4" strokeWidth={2.25} />
        </Link>
      </section>

      {/* ===== Atividade recente — só se houver ===== */}
      {recentServices.length > 0 && (
        <>
          <div className="hairline" />
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-tight">Atividade recente</h2>
              <Link
                href="/servicos"
                className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-0.5"
              >
                Ver tudo
                <ChevronRight className="size-3.5" strokeWidth={2.25} />
              </Link>
            </div>
            <ul>
              {recentServices.map((s, idx) => (
                <li key={s.id}>
                  <Link
                    href="/servicos"
                    className="flex items-center justify-between gap-4 py-3 hover:bg-secondary/40 -mx-2 px-2 rounded-md transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-medium text-foreground truncate">
                        {s.description}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {s.client_name_snapshot || 'Sem cliente'} ·{' '}
                        {new Date(s.service_date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={cn(
                          'text-base font-semibold tabular-nums',
                          s.status === 'paid'
                            ? 'text-success'
                            : s.status === 'cancelled'
                              ? 'text-muted-foreground line-through'
                              : 'text-foreground'
                        )}
                      >
                        {formatCurrency(s.amount)}
                      </p>
                      {s.status === 'pending' && (
                        <p className="text-[11px] text-warning font-medium">
                          Pendente
                        </p>
                      )}
                    </div>
                  </Link>
                  {idx < recentServices.length - 1 && (
                    <div className="hairline ml-0" />
                  )}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
