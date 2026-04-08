import Link from 'next/link'
import { Shield, ChevronRight } from 'lucide-react'
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

  const isAdmin = profile?.role === 'admin'

  return (
    <>
      <PageHeader title="Configurações" subtitle="Seus dados e tokens de pagamento." />

      {isAdmin && (
        <Link
          href="/admin"
          className="flex items-center justify-between gap-3 mb-8 -mx-2 px-3 py-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 size-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="size-5 text-primary" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-foreground">Painel admin</p>
              <p className="text-xs text-muted-foreground">Gerenciar assinantes e planos</p>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground shrink-0" strokeWidth={2} />
        </Link>
      )}

      <ConfiguracoesForm profile={profile} />
    </>
  )
}
