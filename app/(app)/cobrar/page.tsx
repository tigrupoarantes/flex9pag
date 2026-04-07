import { TopBar } from '@/components/layout/TopBar'
import { CobrarForm } from '@/components/payment-links/CobrarForm'

interface CobrarPageProps {
  searchParams: Promise<{ service_id?: string; amount?: string; description?: string }>
}

export default async function CobrarPage({ searchParams }: CobrarPageProps) {
  const params = await searchParams
  return (
    <div>
      <TopBar title="Cobrar Cliente" />
      <CobrarForm
        serviceId={params.service_id}
        initialAmount={params.amount ? parseFloat(params.amount) : undefined}
        initialDescription={params.description ? decodeURIComponent(params.description) : undefined}
      />
    </div>
  )
}
