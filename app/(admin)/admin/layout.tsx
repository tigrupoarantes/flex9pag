import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/inicio')

  return (
    <div className="min-h-screen bg-background">
      {/* TopBar admin — variante do shell normal, com badge "Admin" */}
      <header className="fixed top-0 inset-x-0 z-40 h-14 bg-white/90 backdrop-blur-xl border-b border-border">
        <div className="h-full max-w-5xl mx-auto px-5 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/inicio"
              className="inline-flex items-center justify-center size-8 -ml-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Voltar para o app"
            >
              <ArrowLeft className="size-5" strokeWidth={2} />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-semibold tracking-tight text-foreground">
                flex9pag
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-1.5 py-0.5 rounded bg-primary/10">
                Admin
              </span>
            </div>
          </div>

          {/* Sub-nav admin */}
          <nav className="flex items-center gap-1">
            <AdminNavLink href="/admin">Visão geral</AdminNavLink>
            <AdminNavLink href="/admin/usuarios">Usuários</AdminNavLink>
            <AdminNavLink href="/admin/planos">Planos</AdminNavLink>
          </nav>
        </div>
      </header>

      <main className="pt-14 pb-12 min-h-screen">
        <div className="max-w-5xl mx-auto px-5 lg:px-8 py-8 lg:py-12">
          {children}
        </div>
      </main>
    </div>
  )
}

function AdminNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="hidden sm:inline-flex px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
    >
      {children}
    </Link>
  )
}
