'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { IMaskInput } from 'react-imask'

export function NovoClienteForm() {
  const router = useRouter()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [docType, setDocType] = useState<'cpf' | 'cnpj' | ''>('')
  const [document, setDocument] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('clients').insert({
        name,
        document: document.replace(/\D/g, '') || null,
        document_type: docType || null,
        email: email || null,
        phone: phone.replace(/\D/g, '') || null,
        city: city || null,
        state: state || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente cadastrado!')
      router.push('/clientes')
    },
    onError: () => toast.error('Erro ao salvar. Tente novamente.'),
  })

  const docMask = docType === 'cnpj' ? '00.000.000/0000-00' : '000.000.000-00'

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); save.mutate() }}
      className="px-4 py-4 space-y-5"
    >
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base font-semibold">Nome / Razão Social *</Label>
        <Input
          id="name"
          placeholder="Ex: Transportadora XYZ Ltda"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 text-base"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-base font-semibold">Tipo de documento</Label>
        <Select value={docType} onValueChange={(v) => { setDocType(v as 'cpf' | 'cnpj'); setDocument('') }}>
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="CPF ou CNPJ (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cpf">CPF (pessoa física)</SelectItem>
            <SelectItem value="cnpj">CNPJ (empresa)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {docType && (
        <div className="space-y-2">
          <Label className="text-base font-semibold">{docType.toUpperCase()}</Label>
          <IMaskInput
            mask={docMask}
            placeholder={docType === 'cnpj' ? '00.000.000/0000-00' : '000.000.000-00'}
            value={document}
            onAccept={(value) => setDocument(value as string)}
            className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            inputMode="numeric"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-base font-semibold">Celular / WhatsApp</Label>
        <IMaskInput
          id="phone"
          mask="(00) 00000-0000"
          placeholder="(11) 99999-9999"
          value={phone}
          onAccept={(value) => setPhone(value as string)}
          className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          inputMode="tel"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-base font-semibold">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="cliente@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 text-base"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-base font-semibold">Cidade</Label>
          <Input
            id="city"
            placeholder="São Paulo"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state" className="text-base font-semibold">Estado</Label>
          <Input
            id="state"
            placeholder="SP"
            maxLength={2}
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase())}
            className="h-12 text-base uppercase"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-14 text-base"
        disabled={save.isPending || !name}
      >
        {save.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Salvar cliente'}
      </Button>
    </form>
  )
}
