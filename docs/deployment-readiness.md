# BIM4C deployment readiness

## Deployment order

Deploy in this order:

1. Provision PostgreSQL and, when selected, the public Supabase Storage bucket.
2. Configure backend secrets and run `npx prisma migrate deploy` once against the production database. Do not reset the database or edit deployed migrations.
3. Deploy the backend and require both `GET /health` and `GET /ready` to return HTTP 200. `/ready` verifies the database connection.
4. Deploy the frontend with its production API URLs only after the backend health gate passes.
5. Run the smoke test below and remove every test record and uploaded test object.

Example CI health gate (PowerShell):

```powershell
$api = $env:BIM4C_API_URL.TrimEnd('/')
Invoke-RestMethod "$api/health" | Out-Null
Invoke-RestMethod "$api/ready" | Out-Null
```

Any non-2xx response must stop the frontend deployment. Retry briefly for rollout startup, but do not bypass a persistent readiness failure.

## Required production environment

Backend required: `NODE_ENV=production`, `DATABASE_URL`, `FRONTEND_URL`, `CORS_ORIGINS`, `AUTH_COOKIE_NAME`, `AUTH_SESSION_TTL_HOURS`, `REVALIDATION_URL`, `REVALIDATION_SECRET`, `MEDIA_STORAGE_DRIVER`, and `PUBLIC_API_URL`. Supply `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` through the server secret manager only when bootstrapping or intentionally rotating the bootstrap account. For Supabase storage, also require `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_MEDIA_BUCKET`.

Frontend required: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_USE_MOCK_API=false`, `BACKEND_URL`, `FRONTEND_URL`, `AUTH_COOKIE_NAME`, and server-only `REVALIDATION_SECRET`. `NEXT_PUBLIC_CDN_URL` is optional. Only public origins/CDN/API addresses and the mock-mode flag may use `NEXT_PUBLIC_*`.

## Rendering classification

- Static: legal pages and about page; admin pages are static client shells protected by the session proxy.
- ISR: homepage (60 seconds), projects and blog lists (300 seconds), services and courses lists (600 seconds), with tag-based mutation revalidation.
- On-demand ISR: project, post, service, and course detail routes. Their `generateStaticParams()` deliberately returns no slugs, so a backend list call is not required during build. The first valid request renders and caches the detail route.
- Dynamic server-rendered: API proxy and revalidation route handlers. Admin data calls use `no-store` in the browser.

During `next build`, a temporary backend network/timeout failure yields empty public ISR collections, allowing deployment to continue. This exception applies only in Next's production build phase. Missing API configuration and production runtime API failures are not replaced with mock data or silently swallowed.

## Post-deployment smoke test

Verify homepage, services, projects, courses, blog, and at least one detail route of each type. Then verify admin login, create/update/publish a temporary record, immediate public revalidation, media upload and public image load, settings read/update, and logout. If Supabase is selected, verify the object and PostgreSQL metadata after upload and verify both are absent after delete. Delete all temporary content, metadata, objects, and test accounts before completing the deployment.
