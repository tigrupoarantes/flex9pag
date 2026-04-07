import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { DashboardContent } from '@/components/dashboard/DashboardContent'

export default async function InicioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Buscar dados iniciais do dashboard (mês atual)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const { data: services } = await supabase
    .from('services')
    .select('amount, status, service_date')
    .eq('user_id', user!.id)
    .gte('service_date', monthStart)
    .lte('service_date', monthEnd)

  const { data: nextDas } = await supabase
    .from('das_payments')
    .select('competence_month, due_date, amount, status')
    .eq('user_id', user!.id)
    .eq('status', 'pending')
    .order('due_date', { ascending: true })
    .limit(1)
    .single()

  const paid = services?.filter(s => s.status === 'paid').reduce((acc, s) => acc + s.amount, 0) ?? 0
  const pending = services?.filter(s => s.status === 'pending').reduce((acc, s) => acc + s.amount, 0) ?? 0

  return (
    <div>
      <TopBar title="flex9pag" />
      <DashboardContent
        totalReceived={paid}
        totalPending={pending}
        nextDas={nextDas ?? null}
      />
    </div>
  )
}
