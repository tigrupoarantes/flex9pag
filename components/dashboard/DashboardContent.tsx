'use client'

import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DasPayment } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlusCircle, Receipt, CreditCard, AlertCircle } from 'lucide-react'

interface DashboardContentProps {
  totalReceived: number
  totalPending: number
  nextDas: Pick<DasPayment, 'competence_month' | 'due_date' | 'amount' | 'status'> | null
}

export function DashboardContent({ totalReceived, totalPending, nextDas }: DashboardContentProps) {
  const isNearDas = nextDas && new Date(nextDas.due_date) <= new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Alerta DAS */}
      {isNearDas && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              DAS vence em {formatDate(nextDas!.due_date)}
            </p>
            <p className="text-xs text-amber-600">
              Valor: {formatCurrency(nextDas!.amount ?? 75.60)}
            </p>
            <Link href="/das" className="text-xs text-amber-700 underline font-medium">
              Ver guia DAS
            </Link>
          </div>
        </div>
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 bg-green-50">
          <CardContent className="p-4">
            <p className="text-xs text-green-700 font-medium mb-1">Recebi este mês</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(totalReceived)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-xs text-amber-700 font-medium mb-1">A receber</p>
            <p className="text-2xl font-bold text-amber-700">{formatCurrency(totalPending)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações rápidas</p>
        <div className="grid grid-cols-1 gap-2">
          <Link href="/servicos/novo">
            <Button className="w-full h-14 text-base justify-start gap-3 bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="h-6 w-6" />
              Registrar serviço
            </Button>
          </Link>
          <Link href="/cobrar">
            <Button variant="outline" className="w-full h-14 text-base justify-start gap-3 border-blue-200 text-blue-700">
              <CreditCard className="h-6 w-6" />
              Cobrar cliente
            </Button>
          </Link>
          <Link href="/notas">
            <Button variant="outline" className="w-full h-14 text-base justify-start gap-3">
              <Receipt className="h-6 w-6" />
              Notas fiscais
            </Button>
          </Link>
        </div>
      </div>

      {/* Badge do mês */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date())}
        </Badge>
      </div>
    </div>
  )
}
