import { Building2, HardHat, PencilRuler } from "lucide-react";

export function ExpertiseStrip() {
  return (
    <section className="border-b bg-white" aria-label="Who we work with">
      <div className="site-container flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-5">
        <p className="text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">
          One partner. Your whole project team.
        </p>
        <ul className="flex flex-wrap gap-x-7 gap-y-3">
          {[
            { icon: Building2, label: "Owners & developers" },
            { icon: PencilRuler, label: "Design consultants" },
            { icon: HardHat, label: "Contractors" },
          ].map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2 text-xs font-medium sm:text-sm"
            >
              <Icon className="size-4 text-primary" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
