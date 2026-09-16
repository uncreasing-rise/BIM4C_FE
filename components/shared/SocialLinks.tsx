"use client";

import { useLanguage } from "@/lib/i18n/context";
import React from "react";

export interface SocialItem {
  id: string;
  name: string;
  url: string;
  handle: string;
  icon: ({ className }: { className?: string }) => React.JSX.Element;
  color: string;
  hoverBg: string;
  hoverBorder: string;
  description: string;
  description_en: string;
}

export const LinkedinIcon = ({
  className = "size-4",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6c0-.89-.72-1.6-1.6-1.6Z" />
  </svg>
);

export const FacebookIcon = ({
  className = "size-4",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
  </svg>
);

export const YoutubeIcon = ({
  className = "size-4",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z" />
  </svg>
);

export const ZaloIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2C6.48 2 2 6.03 2 11c0 2.87 1.5 5.43 3.84 7.02-.17.96-.68 2.5-1.57 3.56 1.83-.2 3.8-.93 4.92-1.78.9.26 1.84.4 2.81.4 5.52 0 10-4.03 10-9s-4.48-9-10-9zm-1.8 12.8H7.4v-1.2l2.4-3.2H7.6v-1.2h3.8v1.2l-2.4 3.2h2.8v1.2zm3.8 0h-1.4V8.4h1.4v6.4zm4.2 0h-1.4v-2.8h-2v2.8h-1.4V8.4h1.4v2.4h2V8.4h1.4v6.4z" />
  </svg>
);

export const GithubIcon = ({
  className = "size-4",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
  </svg>
);

// No social account URLs are supplied in the company profile.
export const SOCIAL_NETWORKS: SocialItem[] = [];

interface SocialLinksProps {
  variant?: "cards" | "icons" | "pills";
  className?: string;
}

export function SocialLinks({
  variant = "icons",
  className = "",
}: SocialLinksProps) {
  const { locale } = useLanguage();
  if (variant === "cards") {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 ${className}`}
      >
        {SOCIAL_NETWORKS.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-start gap-3 rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${item.hoverBorder} ${item.hoverBg}`}
            >
              <div
                className={`rounded-xl border border-border bg-background p-2.5 shadow-2xs group-hover:scale-110 transition-transform ${item.color}`}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {item.name}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground truncate">
                    {item.handle}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {locale === "vi" ? item.description : item.description_en}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    );
  }

  if (variant === "pills") {
    return (
      <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
        {SOCIAL_NETWORKS.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 shadow-2xs ${item.hoverBg} ${item.hoverBorder}`}
            >
              <Icon className={`size-3.5 ${item.color}`} />
              <span>{item.name}</span>
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {SOCIAL_NETWORKS.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${item.name} - ${item.handle}`}
            aria-label={item.name}
            className={`flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${item.hoverBg} ${item.hoverBorder}`}
          >
            <Icon className="size-4" />
          </a>
        );
      })}
    </div>
  );
}
