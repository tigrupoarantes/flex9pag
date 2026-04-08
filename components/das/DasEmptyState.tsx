'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Icon } from '@/components/ui/icon'

interface DasEmptyStateProps {
  userId: string
  year: number
}

/**
 * Empty state da página DAS — botão "Criar guias do ano" que dispara
 * a função RPC seed_das_for_user já criada na migration 012.
 */
export function DasEmptyState({ userId, year }: DasEmptyStateProps) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const seed = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('seed_das_for_user', {
        p_user_id: userId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success(`Guias DAS de ${year} criadas!`)
      queryClient.invalidateQueries({ queryKey: ['das'] })
      // Server component precisa re-executar para pegar os novos rows
      window.location.reload()
    },
    onError: () => {
      toast.error('Erro ao criar as guias. Tente novamente.')
    },
  })

  return (
    <div className="bg-surface-container-low rounded-3xl p-10 lg:p-12 text-center max-w-2xl mx-auto">
      <div className="inline-flex w-20 h-20 rounded-3xl bg-primary-fixed text-primary items-center justify-center mb-5">
        <Icon name="calendar_month" className="text-4xl" filled />
      </div>
      <h2 className="font-headline font-extrabold text-2xl text-on-surface mb-2">
        Você ainda não tem suas guias DAS de {year}
      </h2>
      <p className="text-on-surface-variant max-w-md mx-auto mb-6">
        Vamos criar as 12 guias do ano para você acompanhar mês a mês. É rapidinho.
      </p>
      <button
        type="button"
        onClick={() => seed.mutate()}
        disabled={seed.isPending}
        className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform disabled:opacity-60"
      >
        <Icon name="add" />
        {seed.isPending ? 'Criando...' : 'Criar guias do ano'}
      </button>
    </div>
  )
}
