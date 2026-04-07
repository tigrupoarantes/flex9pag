'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CheckCircle, Clock, AlertCircle, XCircle, Search } from 'lucide-react'
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; Icon: React.ElementType }> = {
    active: { label: 'Ativo', className: 'bg-green-100 text-green-800', Icon: CheckCircle },
    trial: { label: 'Trial', className: 'bg-blue-100 text-blue-800', Icon: Clock },
    past_due: { label: 'Inadimplente', className: 'bg-red-100 text-red-800', Icon: AlertCircle },
    cancelled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-600', Icon: XCircle },
  }
  const { label, className, Icon } = map[status] ?? map['cancelled']
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

export function AdminUsuariosList({ profiles, subscriptions, statusFilter }: AdminUsuariosListProps) {
  const supabase = createClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState(statusFilter ?? 'all')

  const subMap = Object.fromEntries(subscriptions.map(s => [s.user_id, s]))

  const changeStatus = useMutation({
    mutationFn: async ({ userId, newStatus }: { userId: string; newStatus: string }) => {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Status atualizado!')
      window.location.reload()
    },
    onError: () => toast.error('Erro ao atualizar status.'),
  })

  const filtered = profiles.filter(p => {
    const sub = subMap[p.id]
    const matchSearch =
      !search ||
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.mei_name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || sub?.status === filter
    return matchSearch && matchFilter
  })

  const filterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'trial', label: 'Trial' },
    { value: 'past_due', label: 'Inadimplentes' },
    { value: 'cancelled', label: 'Cancelados' },
  ]

  return (
    <div className="space-y-4">
      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome..."
            className="pl-9 h-10"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {filterOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-500">{filtered.length} usuário{filtered.length !== 1 ? 's' : ''}</p>

      <div className="space-y-3">
        {filtered.map(profile => {
          const sub = subMap[profile.id]
          return (
            <div key={profile.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{profile.full_name}</p>
                  {profile.mei_name && (
                    <p className="text-sm text-gray-500 truncate">{profile.mei_name}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {profile.city && profile.state ? `${profile.city}/${profile.state} · ` : ''}
                    Cadastro: {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {sub ? <StatusBadge status={sub.status} /> : <StatusBadge status="cancelled" />}
                </div>
              </div>

              {sub && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">{sub.plans?.name ?? '—'}</span>
                    {sub.plans?.price_monthly ? ` · R$ ${sub.plans.price_monthly.toFixed(2).replace('.', ',')}/mês` : ''}
                    {sub.current_period_end && (
                      <> · Vence {new Date(sub.current_period_end).toLocaleDateString('pt-BR')}</>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {sub.status !== 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-green-700 border-green-200 hover:bg-green-50"
                        onClick={() => changeStatus.mutate({ userId: profile.id, newStatus: 'active' })}
                        disabled={changeStatus.isPending}
                      >
                        Ativar
                      </Button>
                    )}
                    {sub.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-red-700 border-red-200 hover:bg-red-50"
                        onClick={() => changeStatus.mutate({ userId: profile.id, newStatus: 'cancelled' })}
                        disabled={changeStatus.isPending}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            Nenhum usuário encontrado
          </div>
        )}
      </div>
    </div>
  )
}
