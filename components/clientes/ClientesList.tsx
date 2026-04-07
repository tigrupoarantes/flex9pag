'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Client } from '@/lib/types'
import { formatPhone } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Users, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export function ClientesList({ initialClients }: { initialClients: Client[] }) {
  const supabase = createClient()

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name')
      if (error) throw error
      return data as Client[]
    },
    initialData: initialClients,
    staleTime: 1000 * 60 * 5,
  })

  if (!clients?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-blue-400" />
        </div>
        <h3 className="font-bold text-gray-900 mb-2">Nenhum cliente cadastrado</h3>
        <p className="text-sm text-gray-500 mb-6">
          Cadastre seus clientes para agilizar o registro de serviços e emissão de notas.
        </p>
        <Link href="/clientes/novo">
          <Button>Cadastrar primeiro cliente</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {clients.map((client) => (
        <Link
          key={client.id}
          href={`/clientes/${client.id}`}
          className="flex items-center px-4 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
            <span className="text-sm font-bold text-blue-700">
              {client.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{client.name}</p>
            {client.phone && (
              <p className="text-sm text-gray-500">{formatPhone(client.phone)}</p>
            )}
            {client.document && (
              <p className="text-xs text-gray-400">
                {client.document_type?.toUpperCase()}: {client.document}
              </p>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </Link>
      ))}
    </div>
  )
}
