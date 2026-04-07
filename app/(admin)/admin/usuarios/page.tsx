import { createClient } from '@/lib/supabase/server'
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

  // Fetch all profiles with their subscriptions
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, mei_name, cnpj, city, state, created_at')
    .order('created_at', { ascending: false })

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('user_id, status, trial_ends_at, current_period_end, plans(name, price_monthly)')

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Usuários</h2>
      <AdminUsuariosList
        profiles={profiles ?? []}
        subscriptions={(subscriptions ?? []) as unknown as SubInfo[]}
        statusFilter={statusFilter}
      />
    </div>
  )
}
