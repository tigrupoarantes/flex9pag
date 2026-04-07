import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const schema = z.object({
  service_id: z.string().uuid().optional(),
  amount: z.number().positive(),
  description: z.string().min(1).max(200),
  gateway: z.enum(['mercadopago', 'stripe']),
  client_id: z.string().uuid().optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { service_id, amount, description, gateway, client_id } = parsed.data

  // Buscar token do gateway do perfil do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('mercadopago_access_token, stripe_account_id, mei_name')
    .eq('id', user.id)
    .single()

  if (gateway === 'mercadopago') {
    const token = profile?.mercadopago_access_token || process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!token) {
      return NextResponse.json(
        { error: 'Mercado Pago não configurado. Vá em Configurações → Pagamentos.' },
        { status: 422 }
      )
    }

    const mp = new MercadoPagoConfig({ accessToken: token })
    const preference = new Preference(mp)

    const paymentLinkId = crypto.randomUUID()

    const pref = await preference.create({
      body: {
        items: [{
          id: service_id ?? paymentLinkId,
          title: description,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: amount,
        }],
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
        external_reference: paymentLinkId,
        expires: true,
        expiration_date_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    })

    const url = pref.init_point!

    // Salvar no banco
    await supabase.from('payment_links').insert({
      id: paymentLinkId,
      user_id: user.id,
      service_id: service_id ?? null,
      client_id: client_id ?? null,
      gateway: 'mercadopago',
      external_id: pref.id,
      amount,
      description,
      url,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })

    // Vincular ao serviço se existir
    if (service_id) {
      await supabase.from('services')
        .update({ payment_link_id: paymentLinkId })
        .eq('id', service_id)
        .eq('user_id', user.id)
    }

    return NextResponse.json({ url, payment_link_id: paymentLinkId })
  }

  // Stripe (V1.5 — placeholder por agora)
  return NextResponse.json({ error: 'Stripe será disponibilizado em breve.' }, { status: 422 })
}
