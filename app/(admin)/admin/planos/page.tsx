import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { AdminPlanosList } from '@/components/admin/AdminPlanosList'
import type { Plan } from '@/lib/types'

export default async function AdminPlanosPage() {
  const supabase = await createClient()

  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .order('price_monthly', { ascending: true })

  return (
    <>
      <PageHeader title="Planos" subtitle="Pacotes de assinatura disponíveis." />
      <AdminPlanosList initialPlans={(plans ?? []) as Plan[]} />
    </>
  )
}
