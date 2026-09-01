# BIM4C Corporate Website

Frontend corporate BIM4C dùng Next.js App Router, React và TypeScript strict. Public content đi qua data-access layer để có thể chuyển từ mock sang Backend API mà không đổi component UI.

## Requirements

- Node.js 20+
- npm 10+

## Installation and development

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Các lệnh kiểm tra và production:

```bash
npm run lint
npm run typecheck
npm run build
npm start
```

## Environment variables

| Variable                   | Mô tả                                              |
| -------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`      | Base URL Backend API, không có dấu `/` cuối        |
| `NEXT_PUBLIC_APP_URL`      | Canonical URL frontend                             |
| `NEXT_PUBLIC_CDN_URL`      | Base URL media/CDN; để trống khi dùng asset nội bộ |
| `NEXT_PUBLIC_USE_MOCK_API` | `true`: mock adapter, `false`: HTTP API            |

Không đặt secret, DB credential hoặc private token trong biến `NEXT_PUBLIC_*` vì các giá trị này có thể xuất hiện trong client bundle.

## Project structure

```text
app/                    App Router pages, metadata, server data composition
components/             Layout, shared and presentational UI
constants/              Frontend routes and navigation
features/               Domain API, model, mapper, selector, schema and form
lib/api/                HTTP client, endpoints, errors and API types
lib/config/             Centralized environment access
lib/utils/              Media, date, slug and storage utilities
mocks/                  Mock adapters/fixtures before backend delivery
types/                  Shared domain-neutral frontend types
docs/                   API contract and backend handoff
data/                   Legacy fixture source, reachable through mocks only
public/                  Static assets
```

## API integration

Public pages are Server Components and call named queries such as `getProjects()` or `getPostBySlug()`. UI receives typed frontend models via props. The HTTP client centralizes JSON/FormData, timeout, cancellation, future auth header and normalized errors.

To connect Backend:

1. Implement the endpoints in `docs/frontend-api-contract.md`.
2. Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_USE_MOCK_API=false`.
3. Adapt feature DTO/mappers if Backend field names differ.
4. Keep pages and presentational components unchanged.

## Mock data

Mock mode is enabled by default. Only feature query/mutation adapters may access mocks. When API integration is complete, legacy fixtures can be deleted after mock mode is retired.

## Cache strategy

- Projects/posts: revalidate every 300 seconds.
- Services/courses: revalidate every 600 seconds.
- Mutations and future authenticated data: `no-store`.

See [Frontend API contract](docs/frontend-api-contract.md) and [Backend handoff](docs/backend-handoff.md).
