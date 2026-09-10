export function LoadingState({
  label = "Loading information",
}: {
  label?: string;
}) {
  return (
    <div
      className="flex min-h-48 items-center justify-center gap-3 text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <span
        className="size-5 animate-spin rounded-full border-2 border-border border-t-primary"
        aria-hidden="true"
      />
      <span>{label}</span>
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
          <div className="h-3 w-32 animate-pulse rounded bg-white/15" />
          <div className="h-12 w-3/4 max-w-xl animate-pulse rounded bg-white/15" />
          <div className="h-5 w-4/5 max-w-lg animate-pulse rounded bg-white/10" />
        </div>
      </section>
      <div className="site-container grid gap-10 py-12 lg:grid-cols-[.78fr_1.22fr]">
        <div className="space-y-4">
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          <div className="h-12 w-full animate-pulse rounded bg-muted" />
          <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
          <div className="h-5 w-3/5 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-4">
          <div className="h-12 animate-pulse rounded-2xl bg-muted" />
          {[1, 2, 3].map((item) => (
            <div
              className="grid gap-4 border-b py-6 sm:grid-cols-[12rem_1fr]"
              key={item}
            >
              <div className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" />
              <div className="space-y-3">
                <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
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
