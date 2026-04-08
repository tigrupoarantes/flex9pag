'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
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

    router.refresh()
    router.push('/inicio')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            flex9pag
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Pagamentos para quem trabalha com as mãos.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seuemail@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 text-base bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
              autoComplete="current-password"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary-hover mt-2"
            disabled={loading || !email || !password}
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : 'Entrar'}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Ao entrar, você concorda com nossos{' '}
          <a href="#" className="underline hover:text-foreground">
            Termos de Uso
          </a>
        </p>
      </div>
    </div>
  )
}
