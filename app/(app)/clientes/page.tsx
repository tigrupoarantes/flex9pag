import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { ClientesList } from '@/components/clientes/ClientesList'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user!.id)
    .order('name')

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle="Quem você atende."
        action={
          <Link
            href="/clientes/novo"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-hover active:scale-95 transition-all"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Novo
          </Link>
        }
      />
      <ClientesList initialClients={clients ?? []} />
    </>
  )
}
