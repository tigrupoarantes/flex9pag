import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { formatMonthYear } from '@/lib/utils'

interface DasAlertBannerProps {
  competenceMonth: string
  dueDate: string
}

/**
 * Banner de alerta DAS — só renderiza se due_date <= hoje + 10 dias (PRD-Func 3.2).
 * O componente assume que já foi verificado pelo parent.
 */
export function DasAlertBanner({ competenceMonth, dueDate }: DasAlertBannerProps) {
  const due = new Date(dueDate)
  const now = new Date()
  const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <section className="relative overflow-hidden bg-primary-container rounded-3xl p-5 lg:p-6 text-on-primary flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="flex items-center gap-4 relative z-10">
        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md shrink-0">
          <Icon name="warning" filled className="text-3xl" />
        </div>
        <div className="min-w-0">
          <h3 className="font-headline font-bold text-base lg:text-lg leading-tight">
            {days <= 0
              ? `DAS de ${formatMonthYear(competenceMonth)} venceu!`
              : days === 1
                ? `DAS de ${formatMonthYear(competenceMonth)} vence amanhã!`
                : `DAS de ${formatMonthYear(competenceMonth)} vence em ${days} dias`}
          </h3>
          <p className="text-on-primary-container text-xs lg:text-sm mt-1">
            Evite multa e mantenha seus benefícios.
          </p>
        </div>
      </div>
      <Link
        href="/das"
        className="bg-surface-container-lowest text-primary font-bold px-6 py-3 rounded-xl shadow-xl hover:bg-primary-fixed active:scale-95 transition-transform relative z-10 self-stretch md:self-auto text-center"
      >
        Pagar agora
      </Link>
    </section>
  )
}
