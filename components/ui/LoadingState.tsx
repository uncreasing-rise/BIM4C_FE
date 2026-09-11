import { Skeleton, CardSkeleton } from "./skeleton";

export function LoadingState({
  label = "Loading information",
}: {
  label?: string;
}) {
  return (
    <div
      className="flex min-h-48 flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <span
        className="size-7 animate-spin rounded-full border-2 border-border border-t-primary"
        aria-hidden="true"
      />
      <span className="font-medium">{label}</span>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CatalogLoadingState({
  label = "Loading BIM4C content",
}: {
  label?: string;
}) {
  return (
    <main aria-busy="true" aria-label={label}>
      <section className="page-hero technical-grid flex items-center bg-brand-ink">
        <div className="site-container space-y-5 py-8" aria-hidden="true">
          <Skeleton className="h-4 w-32 bg-white/20" />
          <Skeleton className="h-12 w-3/4 max-w-xl bg-white/20" />
          <Skeleton className="h-5 w-4/5 max-w-lg bg-white/10" />
        </div>
      </section>
      <div className="site-container grid gap-10 py-12 lg:grid-cols-[.78fr_1.22fr]">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-5 w-3/5" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full rounded-2xl" />
          {[1, 2, 3].map((item) => (
            <div
              className="grid gap-4 border-b border-border py-6 sm:grid-cols-[12rem_1fr]"
              key={item}
            >
              <Skeleton className="aspect-[4/3] rounded-2xl" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {label}
      </p>
    </main>
  );
}
