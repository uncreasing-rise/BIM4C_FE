interface PublicDataFallbackProps {
  title: string;
  description: string;
}

export function PublicDataFallback({
  title,
  description,
}: PublicDataFallbackProps) {
  return (
    <main className="site-container py-24">
      <section className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="eyebrow">BIM4C</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-4 text-muted-foreground">{description}</p>
      </section>
    </main>
  );
}
