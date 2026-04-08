import { AppShell } from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Defesa em profundidade — proxy.ts já redireciona, mas Server Actions
  // chegam como POST no path original, então este check protege também.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <AppShell>{children}</AppShell>
}
