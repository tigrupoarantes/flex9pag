import { cn } from '@/lib/utils'

interface PageSkeletonProps {
  variant: 'dashboard' | 'list' | 'grid'
}

/**
 * Skeleton genérico exibido enquanto o Server Component está
 * resolvendo as queries. Renderizado automaticamente pelo loading.tsx
 * de cada rota via Suspense boundary do App Router.
 *
 * Não precisa ser pixel-perfect — só dar a forma da página pra
 * evitar que o usuário veja "tela em branco".
 */
export function PageSkeleton({ variant }: PageSkeletonProps) {
  return (
    <div className="flex flex-col gap-6 lg:gap-8 animate-pulse">
      {/* Header genérico */}
      <div>
        <div className="h-8 lg:h-12 w-2/3 bg-surface-container rounded-lg" />
        <div className="h-4 w-1/2 bg-surface-container rounded mt-2" />
      </div>

      {variant === 'dashboard' && <DashboardSkeleton />}
      {variant === 'list' && <ListSkeleton />}
      {variant === 'grid' && <GridSkeleton />}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <>
      {/* Bento financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-surface-container-low h-40 rounded-3xl"
          />
        ))}
      </div>
      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="bg-surface-container-low h-20 rounded-3xl" />
        ))}
      </div>
      {/* Recentes */}
      <div className="bg-surface-container-low h-72 rounded-3xl" />
    </>
  )
}

function ListSkeleton() {
  return (
    <>
      {/* Search + filtros */}
      <div className="bg-surface-container h-14 rounded-2xl" />
      <div className="bg-surface-container-low h-12 rounded-2xl" />
      {/* Cards */}
      <div className="grid grid-cols-1 gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'bg-surface-container-lowest rounded-2xl border border-outline-variant/20',
              'h-24 lg:h-28'
            )}
          />
        ))}
      </div>
    </>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-container-low h-36 rounded-2xl"
        />
      ))}
    </div>
  )
}
