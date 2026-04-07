import { createClient } from '@/lib/supabase/server'
import { AdminPlanosList } from '@/components/admin/AdminPlanosList'

export default async function AdminPlanosPage() {
  const supabase = await createClient()

  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .order('price_monthly', { ascending: true })

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Planos</h2>
      <AdminPlanosList plans={plans ?? []} />
    </div>
  )
}
