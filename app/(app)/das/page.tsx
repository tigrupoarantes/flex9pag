import { createClient } from '@/lib/supabase/server'
import { DasList } from '@/components/das/DasList'
import type { DasPayment } from '@/lib/types'

export default async function DasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const year = new Date().getFullYear()

  const { data: das } = await supabase
    .from('das_payments')
    .select('*')
    .eq('user_id', user!.id)
    .gte('competence_month', `${year}-01-01`)
    .lte('competence_month', `${year}-12-31`)
    .order('competence_month', { ascending: true })

  return <DasList das={(das ?? []) as DasPayment[]} userId={user!.id} year={year} />
}
