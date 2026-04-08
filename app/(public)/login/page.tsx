'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Mensagens genéricas — não revelar se foi email ou senha errada
      if (error.message.toLowerCase().includes('invalid')) {
        toast.error('E-mail ou senha incorretos.')
      } else if (error.message.toLowerCase().includes('email not confirmed')) {
        toast.error('Confirme seu e-mail antes de entrar.')
      } else {
        toast.error('Erro ao entrar. Tente novamente.')
      }
      setLoading(false)
      return
    }

    // refresh força o RSC a re-renderizar lendo os novos cookies de sessão
    router.refresh()
    router.push('/inicio')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl font-extrabold text-primary tracking-tight">flex9pag</h1>
          <p className="text-on-surface-variant mt-2 text-sm">
            Gestão de pagamentos para MEI
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seuemail@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base"
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 text-base"
              autoComplete="current-password"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={loading || !email || !password}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Entrar'
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Ao entrar, você concorda com nossos{' '}
          <a href="#" className="underline">Termos de Uso</a>
        </p>
      </div>
    </div>
  )
}
