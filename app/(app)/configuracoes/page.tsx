import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
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
    <div>
      <TopBar title="Configurações" />
      <ConfiguracoesForm profile={profile} />
    </div>
  )
}
