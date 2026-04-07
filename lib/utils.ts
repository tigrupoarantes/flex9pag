import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

export function formatDateLong(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatMonthYear(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '')
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '')
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '')
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

export function generateWhatsAppLink(
  phone: string,
  amount: number,
  paymentUrl: string,
  description: string
): string {
  const message = encodeURIComponent(
    `Olá! Segue o link para pagamento de ${formatCurrency(amount)} referente a: ${description}\n\n${paymentUrl}`
  )
  const cleanPhone = phone.replace(/\D/g, '')
  return `https://wa.me/55${cleanPhone}?text=${message}`
}

export function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11 || /^(\d)\1{10}$/.test(clean)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i)
  let rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  if (rest !== parseInt(clean[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i)
  rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  return rest === parseInt(clean[10])
}

export function isValidCNPJ(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, '')
  if (clean.length !== 14 || /^(\d)\1{13}$/.test(clean)) return false
  const calcDigit = (cnpj: string, length: number) => {
    let sum = 0
    let pos = length - 7
    for (let i = length; i >= 1; i--) {
      sum += parseInt(cnpj[length - i]) * pos--
      if (pos < 2) pos = 9
    }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11)
  }
  return (
    calcDigit(clean, 12) === parseInt(clean[12]) &&
    calcDigit(clean, 13) === parseInt(clean[13])
  )
}

export const MEI_ANNUAL_LIMIT = 81000
export const DAS_SERVICE_AMOUNT = 75.60

export function getMeiLimitPercentage(annualRevenue: number): number {
  return Math.min((annualRevenue / MEI_ANNUAL_LIMIT) * 100, 100)
}
