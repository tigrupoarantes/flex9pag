import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
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
    <>
      <PageHeader title="Novo serviço" subtitle="Anote o que você fez." />
      <NovoServicoForm clients={clients ?? []} />
    </>
  )
}
