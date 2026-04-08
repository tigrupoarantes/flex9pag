'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Profile {
  id: string
  full_name: string
  mei_name: string | null
  cnpj: string | null
  city: string | null
  state: string | null
  created_at: string
}

interface SubInfo {
  user_id: string
  status: string
  trial_ends_at: string | null
  current_period_end: string | null
  plans: { name: string; price_monthly: number } | null
}

interface AdminUsuariosListProps {
  profiles: Profile[]
  subscriptions: SubInfo[]
  statusFilter?: string
}

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  active: { label: 'Ativo', tone: 'text-success' },
  trial: { label: 'Trial', tone: 'text-primary' },
  past_due: { label: 'Inadimplente', tone: 'text-destructive' },
  cancelled: { label: 'Cancelado', tone: 'text-muted-foreground' },
}

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'trial', label: 'Trial' },
  { value: 'past_due', label: 'Inadimplentes' },
  { value: 'cancelled', label: 'Cancelados' },
]

export function AdminUsuariosList({
  profiles,
  subscriptions,
  statusFilter,
}: AdminUsuariosListProps) {
  const supabase = createClient()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState(statusFilter ?? 'all')

  const subMap = useMemo(
    () => Object.fromEntries(subscriptions.map((s) => [s.user_id, s])),
    [subscriptions]
  )

  const changeStatus = useMutation({
    mutationFn: async ({ userId, newStatus }: { userId: string; newStatus: string }) => {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Status atualizado.')
      router.refresh()
    },
    onError: () => toast.error('Erro ao atualizar status.'),
  })

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      const sub = subMap[p.id]
      if (filter !== 'all') {
        if (!sub || sub.status !== filter) return false
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim()
        const matchName = p.full_name.toLowerCase().includes(q)
        const matchMei = (p.mei_name ?? '').toLowerCase().includes(q)
        if (!matchName && !matchMei) return false
      }
      return true
    })
  }, [profiles, filter, search, subMap])

  return (
    <>
      {/* Search + filtros */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
            strokeWidth={2}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou MEI"
            className="bg-secondary border-0 pl-10 h-10 text-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                filter === f.value
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Counter */}
      <p className="text-xs text-muted-foreground mb-4">
        {filtered.length} {filtered.length === 1 ? 'usuário' : 'usuários'}
      </p>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16">
          <div className="size-14 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Users className="size-7 text-muted-foreground" strokeWidth={1.75} />
          </div>
          <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <ul className="border-t border-border">
          {filtered.map((profile) => {
            const sub = subMap[profile.id]
            const statusKey = sub?.status ?? 'cancelled'
            const status = STATUS_LABEL[statusKey] ?? STATUS_LABEL.cancelled
            return (
              <li key={profile.id} className="border-b border-border py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-foreground truncate">
                      {profile.full_name}
                    </p>
                    {profile.mei_name && (
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {profile.mei_name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {profile.city && profile.state
                        ? `${profile.city}/${profile.state} · `
                        : ''}
                      Cadastro:{' '}
                      {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={cn(
                        'text-[11px] font-bold uppercase tracking-wide',
                        status.tone
                      )}
                    >
                      {status.label}
                    </span>
                    {sub?.plans && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sub.plans.name}
                      </p>
                    )}
                  </div>
                </div>

                {sub && (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground">
                      {sub.plans?.price_monthly !== undefined && sub.plans?.price_monthly !== null
                        ? `${formatCurrency(sub.plans.price_monthly)}/mês`
                        : '—'}
                      {sub.current_period_end && (
                        <>
                          {' · Vence '}
                          {new Date(sub.current_period_end).toLocaleDateString('pt-BR')}
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {sub.status !== 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs font-semibold"
                          onClick={() =>
                            changeStatus.mutate({
                              userId: profile.id,
                              newStatus: 'active',
                            })
                          }
                          disabled={changeStatus.isPending}
                        >
                          Ativar
                        </Button>
                      )}
                      {sub.status === 'active' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs font-semibold text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            changeStatus.mutate({
                              userId: profile.id,
                              newStatus: 'cancelled',
                            })
                          }
                          disabled={changeStatus.isPending}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
