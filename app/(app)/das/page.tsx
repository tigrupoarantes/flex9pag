import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { DasList } from '@/components/das/DasList'
import type { DasPayment } from '@/lib/types'

export default async function DasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: das } = await supabase
    .from('das_payments')
    .select('*')
    .eq('user_id', user!.id)
    .order('competence_month', { ascending: true })

  return (
    <div>
      <TopBar title="Guias DAS" />
      <DasList das={(das ?? []) as DasPayment[]} />
    </div>
  )
}
