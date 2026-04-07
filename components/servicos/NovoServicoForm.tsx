'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, CheckCircle, CreditCard } from 'lucide-react'
import { IMaskInput } from 'react-imask'
import Link from 'next/link'

interface Client {
  id: string
  name: string
}

interface NovoServicoFormProps {
  clients: Client[]
}

export function NovoServicoForm({ clients }: NovoServicoFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const today = new Date().toISOString().split('T')[0]
  const [description, setDescription] = useState('')
  const [amountRaw, setAmountRaw] = useState('')
  const [serviceDate, setServiceDate] = useState(today)
  const [clientId, setClientId] = useState('')
  const [clientName, setClientName] = useState('')
  const [notes, setNotes] = useState('')
  const [savedServiceId, setSavedServiceId] = useState<string | null>(null)

  // Converter valor mascarado para número
  const amount = parseFloat(amountRaw.replace(/\./g, '').replace(',', '.')) || 0

  const save = useMutation({
    mutationFn: async () => {
      const selectedClient = clients.find(c => c.id === clientId)
      const { data, error } = await supabase
        .from('services')
        .insert({
          description,
          amount,
          service_date: serviceDate,
          client_id: clientId || null,
          client_name_snapshot: selectedClient?.name || clientName || '',
          notes: notes || null,
          status: 'pending',
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setSavedServiceId(data.id)
      toast.success('Serviço registrado!')
    },
    onError: () => toast.error('Erro ao salvar. Tente novamente.'),
  })

  const markPaid = useMutation({
    mutationFn: async () => {
      if (!savedServiceId) return
      const { error } = await supabase
        .from('services')
        .update({ status: 'paid', paid_at: new Date().toISOString(), payment_method: 'pix' })
        .eq('id', savedServiceId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Marcado como recebido!')
      router.push('/servicos')
    },
  })

  // Tela pós-save: opções
  if (savedServiceId) {
    return (
      <div className="px-4 py-8 flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Serviço salvo!</h2>
          <p className="text-gray-500 mt-1">O que você quer fazer agora?</p>
        </div>
        <div className="w-full space-y-3">
          <Button
            className="w-full h-14 text-base gap-2"
            onClick={() => markPaid.mutate()}
            disabled={markPaid.isPending}
          >
            <CheckCircle className="h-5 w-5" />
            Já recebi o pagamento
          </Button>
          <Link href={`/cobrar?service_id=${savedServiceId}&amount=${amount}&description=${encodeURIComponent(description)}`}>
            <Button variant="outline" className="w-full h-14 text-base gap-2 border-blue-200 text-blue-700">
              <CreditCard className="h-5 w-5" />
              Cobrar via link de pagamento
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full h-12 text-gray-500"
            onClick={() => router.push('/servicos')}
          >
            Deixar pendente por agora
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); save.mutate() }}
      className="px-4 py-4 space-y-5"
    >
      {/* Valor — campo principal */}
      <div className="space-y-2">
        <Label htmlFor="amount" className="text-base font-semibold">Valor do serviço</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
          <IMaskInput
            id="amount"
            mask={Number}
            scale={2}
            thousandsSeparator="."
            radix=","
            mapToRadix={['.']}
            normalizeZeros
            padFractionalZeros
            placeholder="0,00"
            value={amountRaw}
            onAccept={(value) => setAmountRaw(value as string)}
            className="flex h-14 w-full rounded-md border border-input bg-background px-3 py-2 text-2xl font-bold ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring pl-10"
            inputMode="decimal"
            required
          />
        </div>
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-semibold">O que foi feito?</Label>
        <Input
          id="description"
          placeholder="Ex: Frete São Paulo → Campinas"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-12 text-base"
          required
        />
      </div>

      {/* Data */}
      <div className="space-y-2">
        <Label htmlFor="date" className="text-base font-semibold">Data do serviço</Label>
        <Input
          id="date"
          type="date"
          value={serviceDate}
          onChange={(e) => setServiceDate(e.target.value)}
          className="h-12 text-base"
          required
        />
      </div>

      {/* Cliente */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Cliente (opcional)</Label>
        {clients.length > 0 ? (
          <Select value={clientId} onValueChange={(v) => setClientId(v ?? '')}>
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="Selecionar cliente cadastrado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="avulso">— Cliente avulso —</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            placeholder="Nome do cliente (opcional)"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="h-12 text-base"
          />
        )}
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-base font-semibold">Observações (opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Ex: Carga frágil, entrega no galpão 3"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      <Button
        type="submit"
        className="w-full h-14 text-base"
        disabled={save.isPending || !description || amount <= 0}
      >
        {save.isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          'Salvar serviço'
        )}
      </Button>
    </form>
  )
}
