'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Service } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { CreditCard, CheckCircle, FileText, ChevronRight, User } from 'lucide-react'
import Link from 'next/link'

interface ServicosListProps {
  initialServices: Service[]
}

export function ServicosList({ initialServices }: ServicosListProps) {
  const [selected, setSelected] = useState<Service | null>(null)
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*, clients(id, name)')
        .order('service_date', { ascending: false })
        .limit(50)
      if (error) throw error
      return data as Service[]
    },
    initialData: initialServices,
    staleTime: 1000 * 60 * 2,
  })

  const markPaid = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('services')
        .update({ status: 'paid', paid_at: new Date().toISOString(), payment_method: 'pix' })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setSelected(null)
      toast.success('Serviço marcado como recebido!')
    },
    onError: () => toast.error('Erro ao atualizar. Tente novamente.'),
  })

  if (!services?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-blue-400" />
        </div>
        <h3 className="font-bold text-gray-900 mb-2">Nenhum serviço ainda</h3>
        <p className="text-sm text-gray-500 mb-6">
          Registre seu primeiro serviço para começar a controlar seus recebimentos.
        </p>
        <Link href="/servicos/novo">
          <Button>Registrar primeiro serviço</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="divide-y divide-gray-100">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => setSelected(service)}
            className="w-full flex items-center px-4 py-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{service.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{formatDate(service.service_date)}</span>
                {service.clients?.name && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-500 truncate">{service.clients.name}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 ml-3 flex-shrink-0">
              <div className="text-right">
                <p className="font-bold text-gray-900">{formatCurrency(service.amount)}</p>
                <StatusBadge status={service.status} />
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </button>
        ))}
      </div>

      {/* Sheet de detalhe */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="bottom" className="h-auto rounded-t-2xl">
          {selected && (
            <>
              <SheetHeader className="text-left pb-4">
                <SheetTitle className="text-xl">{selected.description}</SheetTitle>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(selected.amount)}</p>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <span className="text-sm text-gray-500">{formatDate(selected.service_date)}</span>
                </div>
              </SheetHeader>

              {selected.clients?.name && (
                <div className="flex items-center gap-2 py-3 text-sm text-gray-600">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{selected.clients.name}</span>
                </div>
              )}

              <Separator className="my-3" />

              <div className="space-y-3 pb-4">
                {selected.status === 'pending' && (
                  <>
                    <Button
                      className="w-full h-12 text-base gap-2"
                      onClick={() => markPaid.mutate(selected.id)}
                      disabled={markPaid.isPending}
                    >
                      <CheckCircle className="h-5 w-5" />
                      Já recebi este pagamento
                    </Button>
                    <Link href={`/cobrar?service_id=${selected.id}&amount=${selected.amount}&description=${encodeURIComponent(selected.description)}`}>
                      <Button variant="outline" className="w-full h-12 text-base gap-2">
                        <CreditCard className="h-5 w-5" />
                        Cobrar via link
                      </Button>
                    </Link>
                  </>
                )}
                {selected.status === 'paid' && !selected.nfse_id && (
                  <Link href={`/notas/nova?service_id=${selected.id}`}>
                    <Button variant="outline" className="w-full h-12 text-base gap-2">
                      <FileText className="h-5 w-5" />
                      Emitir nota fiscal
                    </Button>
                  </Link>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
