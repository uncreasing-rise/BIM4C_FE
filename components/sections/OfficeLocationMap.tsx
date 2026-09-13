"use client";

import { MapPin, Navigation, Clock, Phone, Copy, ExternalLink, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";
import { SocialLinks } from "@/components/shared/SocialLinks";

const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.137999729389!2d108.175353!3d16.0583271!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142191a5fa78e25%3A0x912b24f65ae888fd!2zMjAgQuG6r2MgU8ahbiwgQW4gS2jDqiwgxJDDoCBO4bq1bmcgNTUwMDAwLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1789315062797!5m2!1svi!2s";

const GOOGLE_MAPS_DIRECTION_URL =
  "https://www.google.com/maps/dir/?api=1&destination=16.0583271,108.175353";

const HEADQUARTERS_ADDRESS = "20 Bắc Sơn, An Khê, Đà Nẵng 550000, Việt Nam";

export function OfficeLocationMap() {
  const { t, locale } = useLanguage();
  const isVi = locale === "vi";

  return (
    <section id="office-map" className="py-14 lg:py-20 bg-background relative overflow-hidden">
      <div className="site-container">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="eyebrow">{t.contactPage.mapSection.eyebrow}</p>
            <h2 className="section-title">{t.contactPage.mapSection.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t.contactPage.mapSection.desc}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(HEADQUARTERS_ADDRESS);
                toast.success(
                  isVi
                    ? "Đã sao chép địa chỉ: 20 Bắc Sơn, An Khê, Đà Nẵng 550000, Việt Nam"
                    : "Headquarters address copied to clipboard"
                );
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted transition-colors"
            >
              <Copy className="size-3.5 text-primary" />
              <span>{t.contactPage.mapSection.copyAddressBtn}</span>
            </button>
            <a
              href={GOOGLE_MAPS_DIRECTION_URL}
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/60 px-5 py-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-mono font-bold text-foreground">
                GPS: 16°03&apos;30.0&quot;N 108°10&apos;31.3&quot;E
              </span>
              <span className="text-muted-foreground/40">|</span>
              <span className="text-muted-foreground">{t.contactPage.mapSection.distanceAirport}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground font-mono text-[11px]">
              <Clock className="size-3.5 text-primary" />
              <span>{t.contactPage.mapSection.workingHours}</span>
            </div>
          </div>

          {/* Map & Telemetry HUD Overlay Grid */}
          <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[540px] bg-muted">
            <iframe
              src={MAP_EMBED_URL}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title={isVi ? "Bản đồ vị trí Trụ sở chính BIM4C Đà Nẵng" : "BIM4C Da Nang Headquarters Map"}
              className="w-full h-full grayscale-[10%] contrast-[105%]"
            />

            {/* Floating ConTech Telemetry Card (Bottom-Left on Desktop) */}
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-10">
              <div className="pointer-events-auto rounded-2xl border border-white/20 bg-brand-ink/90 p-4 text-white shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                      {isVi ? "Trụ sở Chính Doanh Nghiệp" : "Corporate Headquarters"}
                    </span>
                  </div>
                  <span className="rounded bg-teal-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-teal-300 border border-teal-500/30">
                    MST: 0402225839
                  </span>
                </div>

                <p className="mt-2.5 text-sm font-bold leading-snug text-white">
                  {isVi
                    ? "CÔNG TY CỔ PHẦN XÂY DỰNG CÔNG NGHỆ BIM4C"
                    : "BIM4C TECHNOLOGY & CONSTRUCTION JOINT STOCK COMPANY"}
                </p>

                <p className="mt-1 flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                  <MapPin className="size-4 shrink-0 text-teal-400 mt-0.5" />
                  <span>
                    {HEADQUARTERS_ADDRESS}
                  </span>
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2.5 text-xs text-slate-300">
                  <a
                    href="tel:+842873004068"
                    className="flex items-center gap-1.5 text-teal-300 hover:text-white transition-colors"
                  >
                    <Phone className="size-3.5" />
                    <span>+84 28 7300 4068</span>
                  </a>
                  <a
                    href={GOOGLE_MAPS_DIRECTION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-teal-300 hover:text-white transition-colors font-medium"
                  >
                    <span>{isVi ? "Mở Google Maps" : "Open Maps"}</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Networks & Digital Channels Section */}
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Share2 className="size-3.5" />
                {isVi ? "Mạng xã hội & Kênh kết nối" : "Social Media & Networks"}
              </p>
              <h3 className="text-xl font-bold text-foreground mt-1">
                {isVi ? "Kết nối với BIM4C trên các nền tảng" : "Connect with BIM4C across platforms"}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm">
              {isVi
                ? "Theo dõi chúng tôi để cập nhật bài viết chuyên môn, video kỹ thuật BIM và các sự kiện ngành mới nhất."
                : "Follow us to stay updated with professional insights, BIM tutorials, and industry events."}
            </p>
          </div>

          <SocialLinks variant="cards" />
        </div>
      </div>
    </section>
  );
}
