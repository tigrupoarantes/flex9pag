import { Icon } from '@/components/ui/icon'

const STEPS = [
  'Entre no app PGMEI ou em gov.br/mei',
  'Gere o boleto ou copie o código Pix',
  'Pague pelo app do seu banco',
  'Volte aqui e marque como pago',
]

export function DasInstructions() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      <div className="bg-surface-container-low p-6 lg:p-8 rounded-3xl flex flex-col justify-between">
        <div>
          <h2 className="font-headline text-2xl lg:text-3xl font-extrabold mb-5 text-on-surface">
            Como pagar o DAS?
          </h2>
          <ul className="space-y-4">
            {STEPS.map((step, idx) => (
              <li key={idx} className="flex gap-4 items-start">
                <span className="bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">
                  {idx + 1}
                </span>
                <p className="text-on-surface-variant pt-1">{step}</p>
              </li>
            ))}
          </ul>
        </div>
        <a
          href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex items-center justify-center gap-3 bg-surface-container-lowest text-primary border-2 border-primary py-4 px-6 rounded-2xl font-bold hover:bg-primary hover:text-on-primary transition-all active:scale-95"
        >
          Acessar gov.br/mei
          <Icon name="open_in_new" />
        </a>
      </div>

      <div className="bg-primary-container p-6 lg:p-8 rounded-3xl text-on-primary flex flex-col justify-end relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="bg-white/15 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
            <Icon name="verified" filled className="text-3xl" />
          </div>
          <h4 className="font-headline text-2xl font-bold mb-2">Cuidado com golpes</h4>
          <p className="text-sm opacity-90 leading-relaxed">
            O DAS é emitido <strong>só pelo portal do governo</strong> (gov.br/mei). Desconfie de boletos enviados por WhatsApp, SMS ou email. Sempre confira o beneficiário antes de pagar.
          </p>
        </div>
      </div>
    </section>
  )
}
