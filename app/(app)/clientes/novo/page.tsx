import { TopBar } from '@/components/layout/TopBar'
import { NovoClienteForm } from '@/components/clientes/NovoClienteForm'

export default function NovoClientePage() {
  return (
    <div>
      <TopBar title="Novo Cliente" />
      <NovoClienteForm />
    </div>
  )
}
