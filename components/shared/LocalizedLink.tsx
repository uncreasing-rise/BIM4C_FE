"use client";

import React, { forwardRef } from "react";
import Link, { LinkProps } from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { localePrefix } from "@/lib/i18n/path";

export interface LocalizedLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>,
    LinkProps {
  children?: React.ReactNode;
}

export const LocalizedLink = forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
  function LocalizedLink({ href, ...props }, ref) {
    const { locale } = useLanguage();

    const localizedHref =
      typeof href === "string"
        ? localePrefix(locale, href)
        : typeof href === "object" && href.pathname
          ? { ...href, pathname: localePrefix(locale, href.pathname) }
          : href;

    return <Link ref={ref} href={localizedHref} {...props} />;
  }
);

LocalizedLink.displayName = "LocalizedLink";
export default LocalizedLink;
