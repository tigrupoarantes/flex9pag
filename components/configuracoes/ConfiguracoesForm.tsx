'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, LogOut, CreditCard, FileText, User } from 'lucide-react'
import { IMaskInput } from 'react-imask'
import type { Profile } from '@/lib/types'

interface ConfiguracoesFormProps {
  profile: Profile | null
}

export function ConfiguracoesForm({ profile }: ConfiguracoesFormProps) {
  const supabase = createClient()

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [meiName, setMeiName] = useState(profile?.mei_name ?? '')
  const [cnpj, setCnpj] = useState(profile?.cnpj ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [city, setCity] = useState(profile?.city ?? '')
  const [state, setState] = useState(profile?.state ?? '')
  const [mpToken, setMpToken] = useState(profile?.mercadopago_access_token ?? '')

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          mei_name: meiName || null,
          cnpj: cnpj.replace(/\D/g, '') || null,
          phone: phone.replace(/\D/g, '') || null,
          city: city || null,
          state: state || null,
        })
        .eq('id', user!.id)
      if (error) throw error
    },
    onSuccess: () => toast.success('Dados salvos!'),
    onError: () => toast.error('Erro ao salvar. Tente novamente.'),
  })

  const saveMp = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('profiles')
        .update({ mercadopago_access_token: mpToken || null })
        .eq('id', user!.id)
      if (error) throw error
    },
    onSuccess: () => toast.success('Token do Mercado Pago salvo!'),
    onError: () => toast.error('Erro ao salvar. Tente novamente.'),
  })

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="px-4 py-4 space-y-6">
      {/* Dados do MEI */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-gray-600" />
          <h2 className="font-bold text-base">Seus dados</h2>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Seu nome</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="João Silva"
              className="h-12"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Nome do negócio (opcional)</Label>
            <Input
              value={meiName}
              onChange={(e) => setMeiName(e.target.value)}
              placeholder="João Freteiro MEI"
              className="h-12"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">CNPJ MEI (opcional)</Label>
            <IMaskInput
              mask="00.000.000/0000-00"
              placeholder="00.000.000/0001-00"
              value={cnpj}
              onAccept={(v) => setCnpj(v as string)}
              className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              inputMode="numeric"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Celular</Label>
            <IMaskInput
              mask="(00) 00000-0000"
              placeholder="(11) 99999-9999"
              value={phone}
              onAccept={(v) => setPhone(v as string)}
              className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              inputMode="tel"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Cidade</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="São Paulo"
                className="h-12"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Estado</Label>
              <Input
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                placeholder="SP"
                maxLength={2}
                className="h-12 uppercase"
              />
            </div>
          </div>

          <Button
            className="w-full h-12"
            onClick={() => saveProfile.mutate()}
            disabled={saveProfile.isPending || !fullName}
          >
            {saveProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar dados'}
          </Button>
        </div>
      </section>

      <hr />

      {/* Mercado Pago */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-gray-600" />
          <h2 className="font-bold text-base">Mercado Pago</h2>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Access Token</Label>
            <Input
              value={mpToken}
              onChange={(e) => setMpToken(e.target.value)}
              placeholder="APP_USR-..."
              className="h-12 font-mono text-sm"
              type="password"
            />
          </div>
          <p className="text-xs text-gray-500">
            Encontre seu token em: Mercado Pago → Sua conta → Credenciais → Access token
          </p>
          <Button
            className="w-full h-12"
            onClick={() => saveMp.mutate()}
            disabled={saveMp.isPending}
          >
            {saveMp.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar token'}
          </Button>
        </div>
      </section>

      <hr />

      {/* NFS-e — placeholder V1.5 */}
      <section className="space-y-2 opacity-60">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-600" />
          <h2 className="font-bold text-base">Nota Fiscal (NFS-e)</h2>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Em breve</span>
        </div>
        <p className="text-sm text-gray-500">
          Integração com Focus NFe — emita NFS-e direto pelo app com 1 toque.
        </p>
      </section>

      <hr />

      <Button
        variant="ghost"
        className="w-full h-12 text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={signOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sair da conta
      </Button>
    </div>
  )
}
