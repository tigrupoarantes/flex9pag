import Link from 'next/link'
import { Users, ChevronRight, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { formatCurrency, cn } from '@/lib/utils'

interface SubWithPlan {
  status: string
  plans: { price_monthly: number } | null
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('status, plans(price_monthly)')

  const all = (subs ?? []) as unknown as SubWithPlan[]
  const active = all.filter((s) => s.status === 'active')
  const trial = all.filter((s) => s.status === 'trial')
  const pastDue = all.filter((s) => s.status === 'past_due')

  const mrr = active.reduce((sum, s) => sum + (s.plans?.price_monthly ?? 0), 0)

  return (
    <>
      <PageHeader
        title="Visão geral"
        subtitle="Métricas dos seus assinantes."
      />

      {/* Hero MRR */}
      <section className="mb-10">
        <p className="text-sm text-muted-foreground mb-2">MRR</p>
        <p className="text-5xl lg:text-6xl font-bold tracking-tight tabular-nums leading-none">
          {formatCurrency(mrr)}
        </p>
        <p className="text-base text-muted-foreground mt-3">
          {active.length} {active.length === 1 ? 'assinante ativo' : 'assinantes ativos'}
        </p>
      </section>

      {/* Counters em lista hairline */}
      <ul className="border-t border-border mb-10">
        <CounterRow label="Trial" value={trial.length} href="/admin/usuarios?status=trial" />
        <CounterRow
          label="Inadimplentes"
          value={pastDue.length}
          href="/admin/usuarios?status=past_due"
          variant={pastDue.length > 0 ? 'destructive' : 'default'}
        />
      </ul>

      {/* Alert de inadimplentes (se houver) */}
      {pastDue.length > 0 && (
        <section className="flex items-start gap-3 mb-10">
          <div className="shrink-0 size-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="size-5 text-destructive" strokeWidth={2.25} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground">
              {pastDue.length} {pastDue.length === 1 ? 'assinante inadimplente' : 'assinantes inadimplentes'}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Revise as assinaturas para regularizar.
            </p>
            <Link
              href="/admin/usuarios?status=past_due"
              className="inline-flex items-center gap-1 mt-2 text-sm text-primary font-medium hover:underline"
            >
              Ver lista
              <ChevronRight className="size-4" strokeWidth={2.25} />
            </Link>
          </div>
        </section>
      )}

      {/* Atalhos */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Gestão</h2>
        <ul className="border-t border-border">
          <ShortcutRow
            href="/admin/usuarios"
            title="Usuários"
            description="Ver e gerenciar todos os MEIs cadastrados"
          />
          <ShortcutRow
            href="/admin/planos"
            title="Planos"
            description="Visualizar planos de assinatura"
          />
        </ul>
      </section>
    </>
  )
}

function CounterRow({
  label,
  value,
  href,
  variant = 'default',
}: {
  label: string
  value: number
  href: string
  variant?: 'default' | 'destructive'
}) {
  return (
    <li className="border-b border-border">
      <Link
        href={href}
        className="flex items-center justify-between gap-4 py-4 -mx-2 px-2 rounded-md hover:bg-secondary/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Users className="size-5 text-muted-foreground" strokeWidth={2} />
          <span className="text-base font-medium text-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-2xl font-semibold tabular-nums',
              variant === 'destructive' && value > 0 && 'text-destructive'
            )}
          >
            {value}
          </span>
          <ChevronRight className="size-4 text-muted-foreground" strokeWidth={2} />
        </div>
      </Link>
    </li>
  )
}

function ShortcutRow({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) {
  return (
    <li className="border-b border-border">
      <Link
        href={href}
        className="flex items-center justify-between gap-4 py-4 -mx-2 px-2 rounded-md hover:bg-secondary/40 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <ChevronRight className="size-4 text-muted-foreground" strokeWidth={2} />
      </Link>
    </li>
  )
}
