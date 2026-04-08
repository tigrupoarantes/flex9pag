import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Callback do Supabase Auth.
 *
 * Para onde o Magic Link / Google OAuth redirecionam após o usuário autenticar.
 * O Supabase entrega um `?code=...` que precisa ser trocado por uma sessão
 * (cookies HttpOnly) via exchangeCodeForSession — isso é o que o PKCE flow exige.
 *
 * Se vier `?next=/algum/path`, redireciona para lá depois do exchange.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/inicio'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin))
    }
  }

  // Sem code ou exchange falhou — manda de volta para login com flag de erro
  return NextResponse.redirect(new URL('/login?error=auth', url.origin))
}
