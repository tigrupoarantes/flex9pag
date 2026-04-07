'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Copy, MessageCircle, CheckCircle } from 'lucide-react'
import { IMaskInput } from 'react-imask'
import { formatCurrency, generateWhatsAppLink } from '@/lib/utils'
import { QRCodeCanvas } from 'qrcode.react'

interface CobrarFormProps {
  serviceId?: string
  initialAmount?: number
  initialDescription?: string
}

export function CobrarForm({ serviceId, initialAmount, initialDescription }: CobrarFormProps) {
  const [amountRaw, setAmountRaw] = useState(
    initialAmount ? initialAmount.toFixed(2).replace('.', ',') : ''
  )
  const [description, setDescription] = useState(initialDescription ?? '')
  const [clientPhone, setClientPhone] = useState('')
  const [paymentUrl, setPaymentUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const amount = parseFloat(amountRaw.replace(/\./g, '').replace(',', '.')) || 0

  const generate = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/payment-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          amount,
          description,
          gateway: 'mercadopago',
        }),
      })
      if (!res.ok) throw new Error('Erro ao gerar link')
      return res.json()
    },
    onSuccess: (data) => {
      setPaymentUrl(data.url)
    },
    onError: () => toast.error('Erro ao gerar link. Verifique sua integração com Mercado Pago.'),
  })

  async function copyLink() {
    await navigator.clipboard.writeText(paymentUrl)
    setCopied(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopied(false), 3000)
  }

  function openWhatsApp() {
    const url = generateWhatsAppLink(clientPhone, amount, paymentUrl, description)
    window.open(url, '_blank')
  }

  // Tela pós-geração
  if (paymentUrl) {
    return (
      <div className="px-4 py-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="text-xl font-bold">Link gerado!</h2>
          <p className="text-gray-500 text-sm">
            Cobrança de <strong>{formatCurrency(amount)}</strong> pronta para enviar.
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <QRCodeCanvas value={paymentUrl} size={180} level="M" />
          </div>
        </div>

        {/* Botões de ação */}
        <div className="space-y-3">
          {clientPhone && (
            <Button
              className="w-full h-14 text-base gap-2 bg-green-600 hover:bg-green-700"
              onClick={openWhatsApp}
            >
              <MessageCircle className="h-5 w-5" />
              Enviar pelo WhatsApp
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full h-14 text-base gap-2"
            onClick={copyLink}
          >
            {copied ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
            {copied ? 'Copiado!' : 'Copiar link'}
          </Button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 text-center">
          O pagamento será confirmado automaticamente quando seu cliente pagar.
        </div>

        <Button
          variant="ghost"
          className="w-full text-gray-400"
          onClick={() => setPaymentUrl('')}
        >
          Gerar nova cobrança
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); generate.mutate() }}
      className="px-4 py-4 space-y-5"
    >
      {/* Valor */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Valor a cobrar</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
          <IMaskInput
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
        <Label htmlFor="desc" className="text-base font-semibold">Descrição do serviço</Label>
        <Input
          id="desc"
          placeholder="Ex: Frete São Paulo → Campinas"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-12 text-base"
          required
        />
      </div>

      {/* Celular do cliente (para WhatsApp) */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">
          Celular do cliente{' '}
          <span className="text-gray-400 font-normal text-sm">(para enviar pelo WhatsApp)</span>
        </Label>
        <IMaskInput
          mask="(00) 00000-0000"
          placeholder="(11) 99999-9999"
          value={clientPhone}
          onAccept={(value) => setClientPhone(value as string)}
          className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          inputMode="tel"
        />
      </div>

      <Button
        type="submit"
        className="w-full h-14 text-base"
        disabled={generate.isPending || amount <= 0 || !description}
      >
        {generate.isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          'Gerar link de cobrança'
        )}
      </Button>

      <p className="text-xs text-center text-gray-400">
        Aceita Pix, boleto e cartão de crédito via Mercado Pago
      </p>
    </form>
  )
}
