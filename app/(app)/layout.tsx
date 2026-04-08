import { AppShell } from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Defesa em profundidade: o proxy.ts já redireciona não-autenticados,
  // mas Server Actions chegam como POST no path original — se um matcher
  // mudar e excluir esta rota, este check garante que a UI/Action ainda
  // é protegida.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Carrega nome do profile para a saudação no TopBar
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <AppShell userName={profile?.full_name || user.email}>
      {children}
    </AppShell>
  )
}
