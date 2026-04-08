import { PageHeader } from '@/components/layout/PageHeader'
import { CobrarForm } from '@/components/payment-links/CobrarForm'

interface CobrarPageProps {
  searchParams: Promise<{ service_id?: string; amount?: string; description?: string }>
}

export default async function CobrarPage({ searchParams }: CobrarPageProps) {
  const params = await searchParams
  return (
    <>
      <PageHeader title="Cobrar cliente" subtitle="Gere um link de pagamento." />
      <CobrarForm
        serviceId={params.service_id}
        initialAmount={params.amount ? parseFloat(params.amount) : undefined}
        initialDescription={params.description ? decodeURIComponent(params.description) : undefined}
      />
    </>
  )
}
