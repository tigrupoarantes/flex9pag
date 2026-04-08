import { MeiLimitBanner } from './MeiLimitBanner'
import { DasAlertBanner } from './DasAlertBanner'
import { FinancialBentoCard } from './FinancialBentoCard'
import { QuickActionCard } from './QuickActionCard'
import { RecentServicesList } from './RecentServicesList'
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

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function getDelta(current: number, previous: number): { pct: number; up: boolean } | null {
  if (previous === 0) {
    return current > 0 ? { pct: 100, up: true } : null
  }
  const diff = current - previous
  const pct = (diff / previous) * 100
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
  const greeting = `${getGreeting()}, ${firstName}!`

  // Banner DAS: só renderiza se due_date <= hoje + 10 dias (PRD-Func 3.2)
  const showDasAlert =
    nextDas && new Date(nextDas.due_date).getTime() - Date.now() <= TEN_DAYS_MS

  const delta = getDelta(totalReceived, prevMonthReceived)

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {/* Saudação */}
      <div>
        <h1 className="font-headline font-extrabold text-2xl lg:text-4xl text-on-surface tracking-tight">
          {greeting}
        </h1>
        <p className="text-on-surface-variant text-sm lg:text-base mt-1">
          Veja como anda o seu mês.
        </p>
      </div>

      {/* Banner limite MEI (só renderiza se ≥ 80%) */}
      <MeiLimitBanner annualRevenue={annualRevenue} />

      {/* Alerta DAS */}
      {showDasAlert && nextDas && (
        <DasAlertBanner
          competenceMonth={nextDas.competence_month}
          dueDate={nextDas.due_date}
        />
      )}

      {/* Bento financeiro */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <FinancialBentoCard
          label="Recebi este mês"
          value={totalReceived}
          variant="received"
          badge={
            delta
              ? {
                  icon: delta.up ? 'trending_up' : 'trending_down',
                  text: `${delta.up ? '+' : '-'}${delta.pct.toFixed(0)}% vs mês passado`,
                }
              : undefined
          }
        />
        <FinancialBentoCard
          label="A receber"
          value={totalPending}
          variant="pending"
          badge={
            pendingCount > 0
              ? {
                  icon: 'schedule',
                  text: `${pendingCount} ${pendingCount === 1 ? 'serviço pendente' : 'serviços pendentes'}`,
                }
              : undefined
          }
        />
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickActionCard
          href="/servicos/novo"
          title="Registrar serviço"
          description="Anote o que recebi"
          icon="assignment_add"
          variant="primary"
        />
        <QuickActionCard
          href="/cobrar"
          title="Cobrar cliente"
          description="Gerar link de pagamento"
          icon="send_money"
          variant="secondary"
        />
      </section>

      {/* Serviços recentes */}
      <RecentServicesList services={recentServices} />
    </div>
  )
}
