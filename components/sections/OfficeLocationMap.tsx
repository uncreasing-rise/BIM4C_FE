"use client";

import { SocialLinks } from "@/components/shared/SocialLinks";
import { useLanguage } from "@/lib/i18n/context";
import {
  Clock,
  Copy,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import {
  usePageContent,
  useSiteSettings,
} from "@/features/page-content/context";
import { telHref } from "@/lib/utils/contact";

import { ui } from "@/lib/i18n/ui";

/** Map, directions and contact card are all derived from the admin address; no address hides the section. */
export function OfficeLocationMap() {
  const { t, locale } = useLanguage();
  const settings = useSiteSettings();
  const map = usePageContent("contact")?.map;
  const address = settings?.address?.trim();
  if (!address) return null;

  const query = encodeURIComponent(address);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${query}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  const phoneHref = telHref(settings?.phone);
  const hasSocial = Object.values(settings?.socialLinks ?? {}).some((url) =>
    url?.trim(),
  );

  return (
    <section
      id="office-map"
      className="py-14 lg:py-20 bg-background relative overflow-hidden"
    >
      <div className="site-container">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            {map?.eyebrow && <p className="eyebrow">{map.eyebrow}</p>}
            {map?.title && <h2 className="section-title">{map.title}</h2>}
            {map?.desc && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {map.desc}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(address);
                toast.success(
                  ui(locale).officeLocationMap
                    .headquartersAddressCopiedToClipboard,
                );
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted transition-colors"
            >
              <Copy className="size-3.5 text-primary" />
              <span>{t.contactPage.mapSection.copyAddressBtn}</span>
            </button>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover transition-colors"
            >
              <Navigation className="size-3.5" />
              <span>{t.contactPage.mapSection.directionsBtn}</span>
              <ExternalLink className="size-3 ml-0.5 opacity-80" />
            </a>
          </div>
        </div>

        {/* Map Viewport Container */}
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl">
          {/* Top Bar on Map */}
          {map?.workingHours && (
            <div className="flex flex-wrap items-center justify-end gap-3 border-b border-border/60 bg-muted/60 px-5 py-3 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground font-mono text-[11px]">
                <Clock className="size-3.5 text-primary" />
                <span>{map.workingHours}</span>
              </div>
            </div>
          )}

          {/* Map & Telemetry HUD Overlay Grid */}
          <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[540px] bg-muted">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title={ui(locale).officeLocationMap.bIM4CDaNangHeadquartersMap}
              className="w-full h-full grayscale-[10%] contrast-[105%]"
            />

            {/* Floating ConTech Telemetry Card (Bottom-Left on Desktop) */}
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-10">
              <div className="pointer-events-auto rounded-2xl border border-white/20 bg-brand-ink/90 p-4 text-white shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                      {ui(locale).officeLocationMap.corporateHeadquarters}
                    </span>
                  </div>
                  <span className="rounded bg-teal-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-teal-300 border border-teal-500/30">
                    BIM4C
                  </span>
                </div>

                <p className="mt-2.5 flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                  <MapPin className="size-4 shrink-0 text-teal-400 mt-0.5" />
                  <span>{address}</span>
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2.5 text-xs text-slate-300">
                  {phoneHref && (
                    <a
                      href={phoneHref}
                      className="flex items-center gap-1.5 text-teal-300 hover:text-white transition-colors"
                    >
                      <Phone className="size-3.5" />
                      <span>{settings?.phone}</span>
                    </a>
                  )}
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-teal-300 hover:text-white transition-colors font-medium"
                  >
                    <span>{ui(locale).officeLocationMap.openMaps}</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Networks & Digital Channels Section */}
        {hasSocial && (
          <div className="mt-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Share2 className="size-3.5" />
                  {ui(locale).officeLocationMap.socialMediaNetworks}
                </p>
                <h3 className="text-xl font-bold text-foreground mt-1">
                  {ui(locale).officeLocationMap.connectWithBIM4CAcrossPlatforms}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm">
                {ui(locale).officeLocationMap.followUsToStayUpdated}
              </p>
            </div>

            <SocialLinks variant="cards" />
          </div>
        )}
      </div>
    </section>
  );
}
