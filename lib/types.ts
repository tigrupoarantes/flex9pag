// Enums
export type ServiceStatus = 'pending' | 'paid' | 'cancelled'
export type PaymentMethod = 'pix' | 'boleto' | 'credit_card' | 'transfer' | 'cash' | 'other'
export type NfseStatus = 'processing' | 'issued' | 'error' | 'cancelled'
export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'cancelled'
export type UserRole = 'user' | 'admin'
export type Gateway = 'mercadopago' | 'stripe'
export type NfseProvider = 'focusnfe' | 'nfeio' | 'enotas'
export type DocumentType = 'cpf' | 'cnpj'

// Database row types
export interface Profile {
  id: string
  full_name: string
  cpf: string | null
  cnpj: string | null
  mei_name: string | null
  phone: string | null
  service_description: string | null
  cnae_code: string | null
  city: string | null
  state: string | null
  role: UserRole
  nfse_provider: NfseProvider | null
  nfse_credentials: Record<string, string> | null
  mercadopago_access_token: string | null
  stripe_account_id: string | null
  payment_gateway: Gateway | 'both' | null
  das_day: number
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  document: string | null
  document_type: DocumentType | null
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  address: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  user_id: string
  client_id: string | null
  client_name_snapshot: string
  description: string
  service_date: string
  amount: number
  status: ServiceStatus
  paid_at: string | null
  payment_method: PaymentMethod | null
  notes: string | null
  nfse_id: string | null
  payment_link_id: string | null
  created_at: string
  updated_at: string
  // Joined
  clients?: Pick<Client, 'id' | 'name'> | null
  nfse_invoices?: Pick<NfseInvoice, 'id' | 'status' | 'pdf_url'> | null
  payment_links?: Pick<PaymentLink, 'id' | 'status' | 'url'> | null
}

export interface PaymentLink {
  id: string
  user_id: string
  service_id: string | null
  client_id: string | null
  gateway: Gateway
  external_id: string | null
  amount: number
  description: string
  url: string
  status: 'active' | 'paid' | 'expired' | 'cancelled'
  paid_at: string | null
  expires_at: string | null
  gateway_metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface NfseInvoice {
  id: string
  user_id: string
  service_id: string | null
  client_id: string | null
  provider: NfseProvider
  external_id: string | null
  protocol_number: string | null
  nfse_number: string | null
  amount: number
  service_description: string
  iss_amount: number | null
  status: NfseStatus
  pdf_url: string | null
  xml_url: string | null
  issued_at: string | null
  error_message: string | null
  raw_response: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface DasPayment {
  id: string
  user_id: string
  competence_month: string
  amount: number | null
  due_date: string
  status: 'pending' | 'paid' | 'overdue'
  paid_at: string | null
  receipt_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Plan {
  id: string
  name: string
  price_monthly: number
  max_nfse_per_month: number | null
  features: Record<string, boolean> | null
  active: boolean
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string | null
  status: SubscriptionStatus
  trial_ends_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  stripe_subscription_id: string | null
  mp_subscription_id: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  // Joined
  plans?: Plan | null
}

// Input types for forms
export interface CreateServiceInput {
  client_id?: string
  client_name_snapshot: string
  description: string
  service_date: string
  amount: number
  notes?: string
}

export interface CreateClientInput {
  name: string
  document?: string
  document_type?: DocumentType
  email?: string
  phone?: string
  city?: string
  state?: string
  address?: string
}

export interface CreatePaymentLinkInput {
  service_id?: string
  client_id?: string
  amount: number
  description: string
  gateway: Gateway
}

// Dashboard stats
export interface DashboardStats {
  paid_count: number
  pending_count: number
  total_received: number
  total_pending: number
  overdue_count: number
  total_overdue: number
  annual_revenue: number
}
