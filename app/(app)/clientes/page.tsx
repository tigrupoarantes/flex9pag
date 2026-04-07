import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { ClientesList } from '@/components/clientes/ClientesList'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user!.id)
    .order('name')

  return (
    <div>
      <TopBar
        title="Clientes"
        action={
          <Link href="/clientes/novo">
            <Button size="sm" className="h-9 gap-1">
              <PlusCircle className="h-4 w-4" />
              Novo
            </Button>
          </Link>
        }
      />
      <ClientesList initialClients={clients ?? []} />
    </div>
  )
}
