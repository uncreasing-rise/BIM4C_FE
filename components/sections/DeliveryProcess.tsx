"use client";

import { useLanguage } from "@/lib/i18n/context";
import {
  ClipboardList,
  FolderCheck,
  Network,
  ScanLine,
  ShieldCheck,
} from "lucide-react";

import { ui } from "@/lib/i18n/ui";
export function DeliveryProcess() {
  const { t, locale } = useLanguage();

  const steps = [
    {
      icon: ClipboardList,
      phase: "01",
      title: ui(locale).deliveryProcess.defineBEPSetup,
      text: ui(locale).deliveryProcess.agreeScopeEIRInformationRequirements,
      output: ui(locale).deliveryProcess.bIMExecutionPlan,
      tag: "ISO 19650-1",
    },
    {
      icon: Network,
      phase: "02",
      title: ui(locale).deliveryProcess.modelingIntegration,
      text: ui(locale).deliveryProcess.bringArchitectureStructureMEPModels,
      output: ui(locale).deliveryProcess.federatedModel,
      tag: "OpenBIM IFC4",
    },
    {
      icon: ScanLine,
      phase: "03",
      title: ui(locale).deliveryProcess.clashResolution,
      text: ui(locale).deliveryProcess.automatedClashDetectionIssueMatrix,
      output: ui(locale).deliveryProcess.modelCoordinationReport,
      tag: "BCF / Navisworks",
    },
    {
      icon: FolderCheck,
      phase: "04",
      title: ui(locale).deliveryProcess.digitalHandover,
      text: ui(locale).deliveryProcess.verifyOutputsExtractAccurateQTO,
      output: ui(locale).deliveryProcess.cOBieAsBuiltTwin,
      tag: "COBie / 7D FM",
    },
  ];

  return (
    <section
      className="delivery-section border-y border-border bg-muted/20 py-16 lg:py-20"
      data-home-section="process"
      id="our-process"
    >
      <div className="site-container">
        <header className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">{t.deliveryProcess.eyebrow}</p>
            <h2 className="section-title">{t.deliveryProcess.title}</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            {t.deliveryProcess.description}
          </p>
        </header>

        <div
          className="delivery-line"
          data-motion="draw-line"
          aria-hidden="true"
        />
        <p className="mb-4 text-xs text-muted-foreground sm:hidden">
          {ui(locale).deliveryProcess.swipeToExploreThe4}
        </p>
        <div className="delivery-steps">
          {steps.map(({ icon: Icon, phase, title, text, output, tag }) => (
            <div
              key={title}
              className="delivery-step group flex flex-col justify-between p-6"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="size-4.5" />
                  </div>
                  <span className="process-number">{phase}</span>
                </div>

                <p className="mt-3 font-mono text-xs font-bold uppercase tracking-wider text-primary">
                  {tag}
                </p>

                <h3 className="mt-1 text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {text}
                </p>
              </div>

              {/* Deliverable Box */}
              <div className="mt-6 rounded-xl border border-border bg-card/80 p-3.5 shadow-xs">
                <span className="block text-xs font-semibold text-muted-foreground">
                  {ui(locale).deliveryProcess.keyDeliverable}
                </span>
                <p className="mt-1 text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-primary shrink-0" />
                  <span>{output}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
