import { createClient } from '@/lib/supabase/server'
import { ServicosList } from '@/components/servicos/ServicosList'

export default async function ServicosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: services } = await supabase
    .from('services')
    .select('*, clients(id, name)')
    .eq('user_id', user!.id)
    .order('service_date', { ascending: false })
    .limit(100)

  return <ServicosList initialServices={services ?? []} />
}
