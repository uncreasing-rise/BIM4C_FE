# Frontend API Contract (Proposed)

This document describes what the frontend expects; it does not claim these endpoints already exist. Base URL is configured by `NEXT_PUBLIC_API_URL`.

## Conventions

- JSON is UTF-8 and uses the camelCase fields documented below. If the final Backend contract uses snake_case, update the feature mapper once rather than leaking snake_case into UI models.
- `id` is an internal identifier; `slug` is used for public detail URLs.
- Dates use ISO 8601 UTC. Nullable values should consistently be `null`.
- Recommended pagination envelope:

```json
{ "data": [], "meta": { "page": 1, "limit": 12, "total": 50, "totalPages": 5 } }
```

## Shared public content

```json
{
  "id": "uuid",
  "slug": "public-slug",
  "title": "Title",
  "description": "Short description",
  "image": "/uploads/cover.webp",
  "eyebrow": "Category label",
  "meta": "Optional display metadata",
  "highlights": ["Highlight"],
  "sections": [
    {
      "title": "Section",
      "body": "Plain text or structured rich-text reference"
    }
  ]
}
```

CMS/backend must sanitize rich content. Frontend does not render arbitrary HTML through `dangerouslySetInnerHTML`.

## Endpoints

### Services

- `GET /services`
- `GET /services/:slug`

### Projects

- `GET /projects?page=1&limit=12&search=&category=&location=&year=&status=&sortBy=&sortOrder=`
- `GET /projects/:slug`

Project fields extend shared content with:

```json
{
  "category": { "id": "uuid", "name": "Nhà cao tầng", "slug": "nha-cao-tang" },
  "location": "Hà Nội",
  "year": 2025,
  "status": "in_progress"
}
```

Backend status values are mapped to frontend labels in `project.mapper.ts`.

### Courses

- `GET /courses`
- `GET /courses/:slug`
- `POST /course-registrations`

```json
{
  "courseId": "uuid",
  "name": "Nguyễn Văn A",
  "email": "a@example.com",
  "phone": "0900000000"
}
```

### Blog

- `GET /posts?page=1&limit=9&search=&category=&sortBy=&sortOrder=`
- `GET /posts/:slug`

### Contact

- `POST /contact`

```json
{
  "name": "Nguyễn Văn A",
  "email": "a@example.com",
  "phone": "0900000000",
  "company": "BIM4C",
  "message": "Nội dung liên hệ"
}
```

### Newsletter

- `POST /newsletter/subscriptions`

```json
{ "email": "a@example.com", "consent": true }
```

Mutation success:

```json
{ "success": true, "message": "Request accepted" }
```

## Error contract

```json
{
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": { "email": ["Email không hợp lệ"] }
}
```

Expected statuses: `400`, `401`, `403`, `404`, `409`, `422`, `500`. Network and timeout errors are normalized by the frontend API client.

Detail endpoints must return `404` when a slug does not exist. The data-access layer converts that status to `null`, allowing the Next.js page to call `notFound()`; other errors remain operational errors.
