import { cn } from '@/lib/utils'

interface PageSkeletonProps {
  variant: 'dashboard' | 'list' | 'grid'
}

/**
 * Skeleton genérico exibido enquanto o Server Component resolve.
 * Renderizado automaticamente pelo loading.tsx via Suspense boundary.
 *
 * Mantém forma do layout Apple-style: pulses de cinza claro,
 * sem cards coloridos.
 */
export function PageSkeleton({ variant }: PageSkeletonProps) {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Header genérico */}
      <div>
        <div className="h-9 lg:h-10 w-2/3 bg-secondary rounded-md" />
        <div className="h-4 w-1/2 bg-secondary rounded-md mt-3" />
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
      <div className="mt-4">
        <div className="h-14 w-3/4 bg-secondary rounded-md" />
        <div className="h-4 w-32 bg-secondary rounded-md mt-3" />
      </div>
      <div className="hairline mt-6" />
      <div>
        <div className="h-4 w-20 bg-secondary rounded-md" />
        <div className="h-8 w-40 bg-secondary rounded-md mt-2" />
      </div>
      <div className="hairline" />
      <div className="h-12 w-full bg-secondary rounded-md mt-2" />
    </>
  )
}

function ListSkeleton() {
  return (
    <>
      <div className="h-10 w-full bg-secondary rounded-md" />
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-7 w-16 bg-secondary rounded-full" />
        ))}
      </div>
      <div className="border-t border-border mt-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn('flex justify-between py-4 border-b border-border')}
          >
            <div className="space-y-2">
              <div className="h-4 w-40 bg-secondary rounded-md" />
              <div className="h-3 w-24 bg-secondary rounded-md" />
            </div>
            <div className="h-5 w-16 bg-secondary rounded-md" />
          </div>
        ))}
      </div>
    </>
  )
}

function GridSkeleton() {
  return (
    <div className="border-t border-border">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between py-4 border-b border-border"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-secondary" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-secondary rounded-md" />
              <div className="h-3 w-32 bg-secondary rounded-md" />
            </div>
          </div>
          <div className="h-5 w-16 bg-secondary rounded-md" />
        </div>
      ))}
    </div>
  )
}
