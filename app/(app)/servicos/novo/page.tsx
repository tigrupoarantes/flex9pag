import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { NovoServicoForm } from '@/components/servicos/NovoServicoForm'

export default async function NovoServicoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .eq('user_id', user!.id)
    .order('name')

  return (
    <div>
      <TopBar title="Novo Serviço" />
      <NovoServicoForm clients={clients ?? []} />
    </div>
  )
}
