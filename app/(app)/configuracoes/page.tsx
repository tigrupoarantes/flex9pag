import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConfiguracoesForm } from '@/components/configuracoes/ConfiguracoesForm'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <>
      <PageHeader title="Configurações" subtitle="Seus dados e tokens de pagamento." />
      <ConfiguracoesForm profile={profile} />
    </>
  )
}
