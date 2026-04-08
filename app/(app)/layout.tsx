import { BottomNav } from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Defesa em profundidade: o proxy.ts já redireciona não-autenticados,
  // mas Server Actions chegam como POST no path original — se um matcher
  // mudar e excluir esta rota, este check garante que a UI/Action ainda
  // é protegida. Veja node_modules/next/dist/docs/01-app/03-api-reference/
  // 03-file-conventions/proxy.md (seção "Execution order").
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-white shadow-sm">
      <main className="flex-1 pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
