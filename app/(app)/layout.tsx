import { AppShell } from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Carrega role pra decidir se mostra link Admin no TopBar
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  return <AppShell isAdmin={isAdmin}>{children}</AppShell>
}
