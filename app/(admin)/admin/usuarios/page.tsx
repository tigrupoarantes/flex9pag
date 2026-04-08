import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { AdminUsuariosList } from '@/components/admin/AdminUsuariosList'

interface SubInfo {
  user_id: string
  status: string
  trial_ends_at: string | null
  current_period_end: string | null
  plans: { name: string; price_monthly: number } | null
}

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const statusFilter = params.status

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, mei_name, cnpj, city, state, created_at')
    .order('created_at', { ascending: false })

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('user_id, status, trial_ends_at, current_period_end, plans(name, price_monthly)')

  return (
    <>
      <PageHeader title="Usuários" subtitle="Todos os MEIs cadastrados." />
      <AdminUsuariosList
        profiles={profiles ?? []}
        subscriptions={(subscriptions ?? []) as unknown as SubInfo[]}
        statusFilter={statusFilter}
      />
    </>
  )
}
