import { PageHeader } from '@/components/layout/PageHeader'
import { NovoClienteForm } from '@/components/clientes/NovoClienteForm'

export default function NovoClientePage() {
  return (
    <>
      <PageHeader title="Novo cliente" subtitle="Preencha os dados do seu cliente." />
      <NovoClienteForm />
    </>
  )
}
