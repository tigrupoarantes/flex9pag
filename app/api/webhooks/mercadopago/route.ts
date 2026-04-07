import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export async function POST(request: Request) {
  // Inicializar dentro do handler — nunca no nível do módulo
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await request.json()

  // Idempotência — ignorar eventos já processados
  const eventId = String(body.id ?? body.data?.id ?? Date.now())
  const { data: existing } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('external_id', eventId)
    .single()

  if (existing) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  // Registrar evento
  await supabase.from('webhook_events').insert({
    gateway: 'mercadopago',
    event_type: body.type ?? 'unknown',
    external_id: eventId,
    payload: body,
  })

  // Processar pagamento aprovado
  if (body.type === 'payment' && body.data?.id) {
    try {
      const token = process.env.MERCADOPAGO_ACCESS_TOKEN!
      const mp = new MercadoPagoConfig({ accessToken: token })
      const paymentApi = new Payment(mp)
      const payment = await paymentApi.get({ id: body.data.id })

      if (payment.status === 'approved') {
        const paymentLinkId = payment.external_reference

        // Atualizar payment_link
        await supabase
          .from('payment_links')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', paymentLinkId)

        // Buscar serviço vinculado e atualizar
        const { data: link } = await supabase
          .from('payment_links')
          .select('service_id')
          .eq('id', paymentLinkId)
          .single()

        if (link?.service_id) {
          await supabase
            .from('services')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString(),
              payment_method: payment.payment_type_id === 'account_money' ? 'pix' : 'credit_card',
            })
            .eq('id', link.service_id)
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error'
      await supabase
        .from('webhook_events')
        .update({ error })
        .eq('external_id', eventId)
    }
  }

  // Marcar como processado
  await supabase
    .from('webhook_events')
    .update({ processed: true, processed_at: new Date().toISOString() })
    .eq('external_id', eventId)

  return NextResponse.json({ ok: true })
}
