# Backend Handoff

## Frontend expects

The frontend currently uses mock adapters. Backend integration can be enabled through environment configuration without changing UI components.

The newsletter form currently calls the Backend directly from a Client Component, so `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_USE_MOCK_API` are intentionally public runtime/build configuration. The API URL must contain no secret, and Backend must allow the deployed frontend origin through CORS. If mutations later move behind Next.js server actions or route handlers, these two variables can be replaced by server-only configuration.

Required groups: services, projects, courses, posts, contact, course registration and newsletter. See `frontend-api-contract.md` for fields and examples.

## Pagination, filter and sort

- Pagination: `page`, `limit`
- Search: `search`
- Project filters: `category`, `location`, `year`, `status`
- Sorting: `sortBy`, `sortOrder=asc|desc`
- Recommended response: `{ data, meta: { page, limit, total, totalPages } }`

## Authentication assumption

Public GET endpoints are anonymous. Future admin/user endpoints should use a secure HttpOnly cookie session or `Authorization: Bearer <token>`. The API client accepts a token per request. Backend must define login, refresh and expiry behavior before auth UI is implemented.

Never expose API secrets in `NEXT_PUBLIC_*` variables.

## Media

Backend may return absolute URLs or paths such as `/uploads/projects/a.webp`. Relative paths are combined with `NEXT_PUBLIC_CDN_URL`. Backend/CDN domains must be added to Next image remote patterns before deployment.

## Error and security requirements

Use the consistent error envelope from the API contract. Apply server-side validation, sanitization and rate limiting to public mutations. CMS rich text must be sanitized or returned in a structured format.

## Cache and invalidation

- Public content is cacheable/revalidated.
- Mutations and authenticated requests are `no-store`.
- Future admin create/update/delete operations must invalidate both list and detail cache entries or revalidation tags.

## Backend still needs to provide

1. Final base URL and API version prefix.
2. Exact response envelope and pagination format.
3. DTO names and status values for each domain.
4. Authentication/session/token lifecycle.
5. CORS and cookie policy.
6. Media/CDN host and upload response format.
7. Rate limits for public mutations.
8. CMS rich-text format and sanitization guarantee.

## Implementation priority

### P0 — required to run the website with Backend data

1. Implement all public GET and mutation endpoints listed in `frontend-api-contract.md`.
2. Return the documented required camelCase DTO fields and `{ success: true, message }` mutation result.
3. Return `404` for unknown detail slugs and the documented JSON error envelope for failures.
4. Confirm the API base URL/version prefix and permit the deployed frontend origin through CORS.
5. Provide reachable absolute media URLs or relative paths compatible with the agreed CDN base URL.

### P1 — required before production

1. Enforce server-side validation, sanitization, rate limiting and anti-abuse controls on all public mutations.
2. Finalize pagination/filter/sort behavior and stable project status values.
3. Define cache headers/revalidation behavior and a content invalidation workflow.
4. Finalize TLS, observability/request IDs, uptime/error monitoring and CORS policy.
5. Guarantee CMS rich-text sanitization and provide production media/CDN domains.

### P2 — enhancement

1. Add authenticated admin CRUD contracts and session/token lifecycle when the admin Backend enters scope.
2. Add upload contracts, responsive media variants and optional search improvements.
3. Add revalidation webhooks/tags and richer editorial preview workflows.
