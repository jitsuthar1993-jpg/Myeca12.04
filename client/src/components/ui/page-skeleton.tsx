import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-white" data-testid="page-skeleton">
      <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Skeleton className="h-5 w-40 mx-auto rounded-full" />
          <Skeleton className="h-10 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-2/3 mx-auto" />
          <div className="flex justify-center gap-3 pt-2">
            <Skeleton className="h-11 w-36 rounded-lg" />
            <Skeleton className="h-11 w-36 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-slate-100 p-6 space-y-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-8">
          <Skeleton className="h-8 w-48 mx-auto" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CalculatorSkeleton() {
  return (
    <div className="min-h-screen bg-white" data-testid="calculator-skeleton">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <div className="rounded-xl border border-slate-100 p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServiceSkeleton() {
  return (
    <div className="min-h-screen bg-white" data-testid="service-skeleton">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-slate-100 p-6 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
