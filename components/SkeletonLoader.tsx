'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function SkeletonProfissional() {
  return (
    <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32 sm:w-40" />
          <Skeleton className="h-4 w-24 sm:w-32" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonServico() {
  return (
    <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
      <div className="space-y-3">
        <Skeleton className="h-5 w-40 sm:w-48" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonHorario() {
  return (
    <Skeleton className="h-12 w-20 sm:w-24 rounded-lg" />
  );
}

export function SkeletonHorarios() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {[...Array(12)].map((_, i) => (
        <SkeletonHorario key={i} />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3, type = 'profissional' }: { count?: number; type?: 'profissional' | 'servico' }) {
  const SkeletonComponent = type === 'profissional' ? SkeletonProfissional : SkeletonServico;
  
  return (
    <div className="grid grid-cols-1 gap-3">
      {[...Array(count)].map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
}
