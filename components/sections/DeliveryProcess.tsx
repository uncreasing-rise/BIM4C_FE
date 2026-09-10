import { ClipboardList, Network, ScanLine, FolderCheck } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Define",
    text: "Agree the scope, information requirements and responsibilities.",
    output: "Delivery plan",
  },
  {
    icon: Network,
    title: "Connect",
    text: "Bring disciplines, models and documents into a shared workflow.",
    output: "Coordinated information",
  },
  {
    icon: ScanLine,
    title: "Resolve",
    text: "Review quality, assign issues and track decisions to closure.",
    output: "Traceable decisions",
  },
  {
    icon: FolderCheck,
    title: "Deliver",
    text: "Check the agreed outputs and prepare information for its next use.",
    output: "Structured handover",
  },
];

export function DeliveryProcess() {
  return (
    <section className="border-y bg-muted/60 py-14 lg:py-16" id="our-process">
      <div className="site-container">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">How we work</p>
            <h2 className="section-title">
              Clear responsibilities. Connected delivery.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-muted-foreground">
            A practical workflow that connects each project decision to an
            agreed deliverable.
          </p>
        </header>
        <ol className="grid gap-0 overflow-hidden rounded-2xl border bg-card sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text, output }, index) => (
            <li
              key={title}
              className="relative border-b border-r p-6 last:border-r-0 lg:border-b-0"
            >
              <div className="flex items-center justify-between">
                <Icon className="size-6 text-primary" />
                <span className="font-mono text-xs text-muted-foreground">
                  0{index + 1} / 04
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {text}
              </p>
              <p className="mt-5 border-t pt-3 text-xs font-medium text-primary">
                {output}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
