import { cn } from '@/lib/utils'

/**
 * Wrapper tipado para Material Symbols Outlined.
 *
 * Os mockups Stitch usam Material Symbols (Google Fonts) — esta união de
 * strings é o conjunto de ícones que o app usa hoje. Adicione novos nomes
 * conforme necessário; o autocomplete impede typos.
 *
 * Doc oficial: https://fonts.google.com/icons
 */
export type IconName =
  // Navegação
  | 'dashboard'
  | 'receipt_long'
  | 'group'
  | 'history_edu'
  | 'settings'
  | 'menu'
  | 'home'
  | 'grid_view'
  | 'list_alt'
  | 'more_horiz'
  | 'more_vert'
  // Ações
  | 'add'
  | 'add_circle'
  | 'add_box'
  | 'search'
  | 'send'
  | 'send_money'
  | 'assignment_add'
  | 'payments'
  | 'event_repeat'
  | 'open_in_new'
  | 'chevron_right'
  | 'chevron_left'
  | 'arrow_forward'
  | 'arrow_back'
  | 'close'
  | 'edit'
  | 'delete'
  | 'logout'
  | 'share'
  | 'content_copy'
  | 'qr_code_2'
  // Status
  | 'check_circle'
  | 'cancel'
  | 'warning'
  | 'error'
  | 'info'
  | 'schedule'
  | 'verified'
  | 'trending_up'
  | 'trending_down'
  // Notificações / suporte
  | 'notifications'
  | 'help'
  | 'mail'
  // Categorias de serviço (mockup)
  | 'local_shipping'
  | 'construction'
  | 'electric_bolt'
  | 'brush'
  | 'plumbing'
  | 'handyman'
  | 'cleaning_services'
  | 'agriculture'
  // Datas / financeiro
  | 'calendar_today'
  | 'calendar_month'
  | 'attach_money'
  | 'account_balance'
  | 'account_balance_wallet'
  | 'savings'
  // Pessoa
  | 'person'
  | 'badge'
  | 'phone'
  | 'whatsapp'

interface IconProps {
  name: IconName
  className?: string
  /** Preenche o ícone (font-variation-settings 'FILL' 1) */
  filled?: boolean
  /** Peso do traço — 100 a 700, default 400 */
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700
  /** Tamanho ótico — 20 a 48 (px), default 24 */
  opsz?: 20 | 24 | 40 | 48
}

export function Icon({
  name,
  className,
  filled = false,
  weight = 400,
  opsz = 24,
}: IconProps) {
  return (
    <span
      className={cn('material-symbols-outlined select-none leading-none', className)}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${opsz}`,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
