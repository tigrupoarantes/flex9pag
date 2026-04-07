import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, DollarSign, TrendingDown, Clock } from 'lucide-react'

interface SubWithPlan {
  status: string
  plans: { price_monthly: number } | null
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch subscriptions with plan info
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('status, plans(price_monthly)')

  const active = (subs ?? []).filter(s => s.status === 'active')
  const trial = (subs ?? []).filter(s => s.status === 'trial')
  const pastDue = (subs ?? []).filter(s => s.status === 'past_due')
  const cancelled = (subs ?? []).filter(s => s.status === 'cancelled')

  const mrr = active.reduce((sum, s) => {
    const sub = s as unknown as SubWithPlan
    return sum + (sub.plans?.price_monthly ?? 0)
  }, 0)

  const stats = [
    { label: 'MRR', value: `R$ ${mrr.toFixed(2).replace('.', ',')}`, icon: DollarSign, color: 'bg-green-50 text-green-700' },
    { label: 'Ativos', value: String(active.length), icon: Users, color: 'bg-blue-50 text-blue-700' },
    { label: 'Trial', value: String(trial.length), icon: Clock, color: 'bg-amber-50 text-amber-700' },
    { label: 'Inadimplentes', value: String(pastDue.length), icon: TrendingDown, color: 'bg-red-50 text-red-700' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className={`rounded-xl p-4 ${s.color.split(' ')[0]}`}>
              <div className={`flex items-center gap-2 mb-1 ${s.color.split(' ')[1]}`}>
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold ${s.color.split(' ')[1]}`}>{s.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/usuarios"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold">Usuários</p>
              <p className="text-sm text-gray-500">Ver todos os MEIs cadastrados</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/planos"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold">Planos</p>
              <p className="text-sm text-gray-500">Gerenciar planos de assinatura</p>
            </div>
          </div>
        </Link>
      </div>

      {pastDue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="font-semibold text-red-800 mb-1">
            {pastDue.length} assinante{pastDue.length > 1 ? 's' : ''} inadimplente{pastDue.length > 1 ? 's' : ''}
          </p>
          <p className="text-sm text-red-600">
            Acesse a lista de usuários para verificar e agir.
          </p>
          <Link href="/admin/usuarios?status=past_due" className="text-sm font-medium text-red-700 underline mt-2 inline-block">
            Ver inadimplentes →
          </Link>
        </div>
      )}
    </div>
  )
}
