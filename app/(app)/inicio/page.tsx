import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/components/dashboard/DashboardContent'

export default async function InicioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
  const yearEnd = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]

  // Mês atual: serviços (paid + pending)
  const { data: monthServices } = await supabase
    .from('services')
    .select('amount, status')
    .eq('user_id', user!.id)
    .gte('service_date', monthStart)
    .lte('service_date', monthEnd)

  // Mês anterior: só paid (para calcular delta %)
  const { data: prevMonthServices } = await supabase
    .from('services')
    .select('amount')
    .eq('user_id', user!.id)
    .eq('status', 'paid')
    .gte('service_date', prevMonthStart)
    .lte('service_date', prevMonthEnd)

  // Ano corrente: só paid (para banner limite MEI)
  const { data: yearServices } = await supabase
    .from('services')
    .select('amount')
    .eq('user_id', user!.id)
    .eq('status', 'paid')
    .gte('service_date', yearStart)
    .lte('service_date', yearEnd)

  // Próximo DAS pendente
  const { data: nextDas } = await supabase
    .from('das_payments')
    .select('competence_month, due_date, amount, status')
    .eq('user_id', user!.id)
    .eq('status', 'pending')
    .order('due_date', { ascending: true })
    .limit(1)
    .maybeSingle()

  // 4 serviços mais recentes (qualquer status)
  const { data: recentServices } = await supabase
    .from('services')
    .select('id, description, amount, status, service_date, client_name_snapshot')
    .eq('user_id', user!.id)
    .order('service_date', { ascending: false })
    .limit(4)

  // Profile (nome para saudação)
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  // Pendentes do mês — count para badge
  const pendingCount = monthServices?.filter(s => s.status === 'pending').length ?? 0
  const totalReceived = monthServices?.filter(s => s.status === 'paid').reduce((acc, s) => acc + s.amount, 0) ?? 0
  const totalPending = monthServices?.filter(s => s.status === 'pending').reduce((acc, s) => acc + s.amount, 0) ?? 0
  const prevMonthReceived = prevMonthServices?.reduce((acc, s) => acc + s.amount, 0) ?? 0
  const annualRevenue = yearServices?.reduce((acc, s) => acc + s.amount, 0) ?? 0

  return (
    <DashboardContent
      userName={profile?.full_name || null}
      totalReceived={totalReceived}
      totalPending={totalPending}
      prevMonthReceived={prevMonthReceived}
      annualRevenue={annualRevenue}
      pendingCount={pendingCount}
      nextDas={nextDas ?? null}
      recentServices={recentServices ?? []}
    />
  )
}
