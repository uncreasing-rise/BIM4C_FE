# Security headers deployment notes

The application currently sends `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy`, and `X-Frame-Options` from `next.config.ts`. Admin routes
also send `X-Robots-Tag`.

HSTS must be enabled at the HTTPS ingress/CDN only after HTTP-to-HTTPS redirects
and all production subdomains are verified. It is intentionally not emitted by
the local Next.js server.

A production CSP is documented rather than enabled blindly. Its policy must
account for:

- Next.js scripts, styles, image optimization, and font assets from `self`;
- the configured `NEXT_PUBLIC_API_URL` for public form submissions;
- `NEXT_PUBLIC_CDN_URL` and Supabase public storage for images/media;
- image `data:` URLs only if CMS-authored data images remain supported;
- approved video destinations if embeds are introduced later.

Start with `Content-Security-Policy-Report-Only` in the deployed environment,
collect violations, then enforce a nonce-based policy. Keep `frame-ancestors
'none'` aligned with the existing `X-Frame-Options: DENY`. Do not add broad
`*`, `unsafe-eval`, or unreviewed third-party origins to make violations pass.
