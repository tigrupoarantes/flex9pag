'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Calendar, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DasEmptyStateProps {
  userId: string
  year: number
}

export function DasEmptyState({ userId, year }: DasEmptyStateProps) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const router = useRouter()

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
      router.refresh()
    },
    onError: () => toast.error('Erro ao criar as guias. Tente novamente.'),
  })

  return (
    <div className="flex flex-col items-center text-center py-16">
      <div className="size-14 rounded-full bg-secondary flex items-center justify-center mb-4">
        <Calendar className="size-7 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        Sem guias DAS de {year}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Vamos criar as 12 guias do ano para você acompanhar mês a mês.
      </p>
      <button
        type="button"
        onClick={() => seed.mutate()}
        disabled={seed.isPending}
        className="inline-flex items-center gap-1.5 h-11 px-5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-60"
      >
        <Plus className="size-4" strokeWidth={2.5} />
        {seed.isPending ? 'Criando...' : 'Criar guias do ano'}
      </button>
    </div>
  )
}
