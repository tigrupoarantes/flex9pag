import {
  // Navegação
  LayoutDashboard,
  Home,
  Receipt,
  Users,
  CalendarDays,
  Settings,
  Menu,
  Grid3x3,
  List,
  MoreHorizontal,
  MoreVertical,
  // Ações
  Plus,
  PlusCircle,
  PlusSquare,
  Search,
  Send,
  HandCoins,
  ClipboardPlus,
  CreditCard,
  CalendarClock,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  X,
  Pencil,
  Trash2,
  LogOut,
  Share2,
  Copy,
  QrCode,
  // Status
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  // Header / suporte
  Bell,
  HelpCircle,
  Mail,
  // Categorias
  Truck,
  Wrench,
  Zap,
  Brush,
  Hammer,
  Sparkles,
  Sprout,
  // Datas / financeiro
  Calendar,
  DollarSign,
  Landmark,
  Wallet,
  PiggyBank,
  // Pessoa
  User,
  IdCard,
  Phone,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * União de strings que mapeia para ícones Lucide.
 * Mantém os nomes "estilo Material" usados pelo código existente,
 * mas internamente renderiza Lucide (que combina com a estética
 * Apple Health: outline geométrico, traço fino).
 */
export type IconName =
  // Navegação
  | 'dashboard' | 'receipt_long' | 'group' | 'history_edu' | 'settings'
  | 'menu' | 'home' | 'grid_view' | 'list_alt' | 'more_horiz' | 'more_vert'
  // Ações
  | 'add' | 'add_circle' | 'add_box' | 'search' | 'send' | 'send_money'
  | 'assignment_add' | 'payments' | 'event_repeat' | 'open_in_new'
  | 'chevron_right' | 'chevron_left' | 'arrow_forward' | 'arrow_back'
  | 'close' | 'edit' | 'delete' | 'logout' | 'share' | 'content_copy' | 'qr_code_2'
  // Status
  | 'check_circle' | 'cancel' | 'warning' | 'error' | 'info' | 'schedule'
  | 'verified' | 'trending_up' | 'trending_down'
  // Notificações
  | 'notifications' | 'help' | 'mail'
  // Categorias
  | 'local_shipping' | 'construction' | 'electric_bolt' | 'brush'
  | 'plumbing' | 'handyman' | 'cleaning_services' | 'agriculture'
  // Datas / financeiro
  | 'calendar_today' | 'calendar_month' | 'attach_money' | 'account_balance'
  | 'account_balance_wallet' | 'savings'
  // Pessoa
  | 'person' | 'badge' | 'phone' | 'whatsapp'

const ICON_MAP: Record<IconName, LucideIcon> = {
  // Navegação
  dashboard: LayoutDashboard,
  receipt_long: Receipt,
  group: Users,
  history_edu: CalendarDays,
  settings: Settings,
  menu: Menu,
  home: Home,
  grid_view: Grid3x3,
  list_alt: List,
  more_horiz: MoreHorizontal,
  more_vert: MoreVertical,
  // Ações
  add: Plus,
  add_circle: PlusCircle,
  add_box: PlusSquare,
  search: Search,
  send: Send,
  send_money: HandCoins,
  assignment_add: ClipboardPlus,
  payments: CreditCard,
  event_repeat: CalendarClock,
  open_in_new: ExternalLink,
  chevron_right: ChevronRight,
  chevron_left: ChevronLeft,
  arrow_forward: ArrowRight,
  arrow_back: ArrowLeft,
  close: X,
  edit: Pencil,
  delete: Trash2,
  logout: LogOut,
  share: Share2,
  content_copy: Copy,
  qr_code_2: QrCode,
  // Status
  check_circle: CheckCircle2,
  cancel: XCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
  schedule: Clock,
  verified: ShieldCheck,
  trending_up: TrendingUp,
  trending_down: TrendingDown,
  // Notificações
  notifications: Bell,
  help: HelpCircle,
  mail: Mail,
  // Categorias
  local_shipping: Truck,
  construction: Hammer,
  electric_bolt: Zap,
  brush: Brush,
  plumbing: Wrench,
  handyman: Wrench,
  cleaning_services: Sparkles,
  agriculture: Sprout,
  // Datas / financeiro
  calendar_today: Calendar,
  calendar_month: Calendar,
  attach_money: DollarSign,
  account_balance: Landmark,
  account_balance_wallet: Wallet,
  savings: PiggyBank,
  // Pessoa
  person: User,
  badge: IdCard,
  phone: Phone,
  whatsapp: MessageCircle,
}

interface IconProps {
  name: IconName
  className?: string
  /** Mantido para compat — em Lucide controla strokeWidth (filled = 2.5). */
  filled?: boolean
  /** Mantido para compat — Lucide usa strokeWidth, então mapeio. */
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700
  /** Mantido para compat — sem efeito, dimensão controlada por className. */
  opsz?: 20 | 24 | 40 | 48
}

/**
 * Wrapper que renderiza Lucide via API "Material Symbols-style" para
 * preservar os call sites existentes. Tamanho é via className (text-2xl,
 * text-3xl etc) — Lucide herda `width: 1em; height: 1em` automaticamente.
 */
export function Icon({ name, className, filled, weight }: IconProps) {
  const Component = ICON_MAP[name]
  if (!Component) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`<Icon> nome desconhecido: ${name}`)
    }
    return null
  }
  // Lucide aceita strokeWidth: number — uso para simular weight do Material
  const strokeWidth =
    filled || (weight && weight >= 600) ? 2.5 :
    weight && weight <= 300 ? 1.25 :
    1.75
  return (
    <Component
      aria-hidden="true"
      strokeWidth={strokeWidth}
      className={cn('inline-block shrink-0 size-[1em]', className)}
    />
  )
}
