import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";

const areas = [
  [
    "01",
    "BIM strategy",
    "Standards & delivery planning",
    ROUTES.serviceDetail("tu-van-bim"),
  ],
  [
    "02",
    "Model coordination",
    "Connected disciplines",
    ROUTES.serviceDetail("bim-coordination"),
  ],
  ["03", "Team development", "Practical BIM training", ROUTES.courses],
  [
    "04",
    "Asset information",
    "Digital handover & operations",
    ROUTES.serviceDetail("digital-twin-va-du-lieu-tai-san"),
  ],
] as const;

export function ExpertiseStrip() {
  return (
    <section className="border-b bg-card" aria-label="Explore our expertise">
      <div className="site-container grid grid-cols-2 lg:grid-cols-4">
        {areas.map(([number, title, description, href]) => (
          <Link
            href={href}
            key={title}
            className="group min-w-0 border-b border-border/60 px-3 py-6 transition-colors hover:bg-muted sm:px-6 lg:border-b-0"
          >
            <span className="flex items-center justify-between text-xs font-medium text-primary">
              {number}
              <ArrowUpRight className="size-4" />
            </span>
            <h2 className="mt-3 text-base font-semibold tracking-tight sm:text-lg">
              {title}
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
              {description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
