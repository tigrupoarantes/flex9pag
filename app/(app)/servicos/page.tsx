import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { ServicosList } from '@/components/servicos/ServicosList'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'

export default async function ServicosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: services } = await supabase
    .from('services')
    .select('*, clients(id, name)')
    .eq('user_id', user!.id)
    .order('service_date', { ascending: false })
    .limit(50)

  return (
    <div>
      <TopBar
        title="Meus Serviços"
        action={
          <Link href="/servicos/novo">
            <Button size="sm" className="h-9 gap-1">
              <PlusCircle className="h-4 w-4" />
              Novo
            </Button>
          </Link>
        }
      />
      <ServicosList initialServices={services ?? []} />
    </div>
  )
}
