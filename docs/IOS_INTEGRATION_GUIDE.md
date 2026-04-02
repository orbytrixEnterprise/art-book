# iOS Integration Guide — Static JSON Data

This document explains how to consume the static JSON files published to the GitHub repository. All files are read-only from the iOS side — your app just fetches them over HTTPS.

---

## Base URL

All files live in the GitHub repository. The raw content base URL is:

```
https://raw.githubusercontent.com/{GITHUB_OWNER}/{GITHUB_REPO}/main
```

Replace `{GITHUB_OWNER}` and `{GITHUB_REPO}` with the actual org/repo name (ask the backend team).

---

## Two Approaches — Pick One

### Approach A: Paginated (recommended for large datasets)

Use this if you want lazy loading, pagination, and minimal initial payload. Files live inside the `detail-json/` folder.

### Approach B: Single Full File (simpler, smaller datasets)

Use this if you want everything in one request. One file at the repo root.

---

## Approach A — Paginated File Structure

```
detail-json/
├── index.json                        ← start here
├── categories.json                   ← list of all categories + previews
├── config/
│   └── app-config.json               ← feature flags, version info
└── data/
    ├── {category-slug}.json          ← pagination metadata per category
    └── {category-slug}/
        ├── page-1.json               ← first 50 docs
        ├── page-2.json               ← next 50 docs
        └── ...
```

### Step 1 — Fetch `index.json`

```
GET detail-json/index.json
```

```json
{
  "version": "1.0.4",
  "last_updated": "2026-04-02T15:30:00.000Z",
  "endpoints": {
    "categories": "/categories.json",
    "config": "/config/app-config.json"
  }
}
```

Use `version` to detect if the data has changed since the last app launch. Cache it locally and compare on next launch — if it changed, refresh your local data.

---

### Step 2 — Fetch `categories.json`

```
GET detail-json/categories.json
```

```json
{
  "total": 5,
  "data": [
    {
      "id": "64a1b2c3d4e5f6a7b8c9d0e1",
      "name": "Portraits",
      "slug": "portraits",
      "icon": "🎨",
      "description": "Portrait drawings and sketches",
      "total_items": 120,
      "endpoint": "/data/portraits.json",
      "preview": [
        {
          "id": "64a1b2c3d4e5f6a7b8c9d0e2",
          "title": "Charcoal Portrait",
          "image": "https://res.cloudinary.com/.../portrait1.jpg"
        },
        {
          "id": "64a1b2c3d4e5f6a7b8c9d0e3",
          "title": "Pencil Sketch",
          "image": "https://res.cloudinary.com/.../portrait2.jpg"
        },
        {
          "id": "64a1b2c3d4e5f6a7b8c9d0e4",
          "title": "Oil Portrait",
          "image": null
        }
      ]
    }
  ]
}
```

**Fields:**
| Field | Type | Description |
|---|---|---|
| `id` | String | MongoDB ObjectId as string |
| `name` | String | Display name |
| `slug` | String | URL-safe identifier used in file paths |
| `icon` | String | Emoji icon for the category |
| `description` | String | Short description |
| `total_items` | Int | Total active documents in this category |
| `endpoint` | String | Path to the category pagination index (relative to `detail-json/`) |
| `preview` | Array | Latest 3 documents — use for home screen cards |
| `preview[].image` | String\|null | Resolved image URL — can be null if no image exists |

---

### Step 3 — Fetch Category Pagination Index

```
GET detail-json/data/{slug}.json
```

Example: `detail-json/data/portraits.json`

```json
{
  "category": {
    "id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "name": "Portraits",
    "slug": "portraits"
  },
  "total": 120,
  "pagination": {
    "page_size": 50,
    "total_pages": 3
  },
  "pages": [
    "/data/portraits/page-1.json",
    "/data/portraits/page-2.json",
    "/data/portraits/page-3.json"
  ]
}
```

Use `total_pages` to know how many pages exist. Fetch pages on demand as the user scrolls.

---

### Step 4 — Fetch a Page

```
GET detail-json/data/{slug}/page-{n}.json
```

Example: `detail-json/data/portraits/page-1.json`

```json
{
  "page": 1,
  "has_more": true,
  "data": [
    {
      "id": "64a1b2c3d4e5f6a7b8c9d0e2",
      "title": "Charcoal Portrait",
      "image": "https://res.cloudinary.com/.../portrait1.jpg"
    },
    {
      "id": "64a1b2c3d4e5f6a7b8c9d0e3",
      "title": "Pencil Sketch",
      "image": null
    }
  ]
}
```

**Fields:**
| Field | Type | Description |
|---|---|---|
| `page` | Int | Current page number (1-based) |
| `has_more` | Bool | `true` if more pages follow — use for infinite scroll |
| `data[].id` | String | Document ID |
| `data[].title` | String | Document title |
| `data[].image` | String\|null | Best available image URL, or null |

Each page contains up to **50 documents**, sorted by `createdAt DESC` (newest first).

---

### Step 5 — Fetch App Config (optional)

```
GET detail-json/config/app-config.json
```

```json
{
  "force_update": false,
  "latest_version": "1.0.4",
  "features": {
    "ads_enabled": true
  }
}
```

Check `force_update` on launch — if `true`, block the UI and prompt the user to update the app.

---

## Approach B — Single Full File

If you want everything in one shot (all categories + all documents with full detail):

```
GET full-data.json
```

```json
{
  "generated_at": "2026-04-02T15:30:00.000Z",
  "total_categories": 5,
  "total_documents": 243,
  "data": [
    {
      "id": "64a1b2c3d4e5f6a7b8c9d0e1",
      "name": "Portraits",
      "slug": "portraits",
      "icon": "🎨",
      "description": "Portrait drawings and sketches",
      "total_items": 120,
      "documents": [
        {
          "id": "64a1b2c3d4e5f6a7b8c9d0e2",
          "title": "Charcoal Portrait",
          "description": "A detailed charcoal portrait study",
          "status": "active",
          "image": "https://res.cloudinary.com/.../portrait1.jpg",
          "main_image": {
            "cloudinaryId": "folder/portrait1",
            "url": "https://res.cloudinary.com/.../portrait1.jpg"
          },
          "images": [
            {
              "id": "64a1b2c3d4e5f6a7b8c9d0e5",
              "url": "https://res.cloudinary.com/.../img1.jpg",
              "order": 1
            },
            {
              "id": "64a1b2c3d4e5f6a7b8c9d0e6",
              "url": "https://res.cloudinary.com/.../img2.jpg",
              "order": 2
            }
          ],
          "createdAt": "2026-03-15T10:00:00.000Z",
          "updatedAt": "2026-03-20T14:30:00.000Z"
        }
      ]
    }
  ]
}
```

**Document fields:**
| Field | Type | Description |
|---|---|---|
| `id` | String | Document ID |
| `title` | String | Title |
| `description` | String | Full description text |
| `status` | String | Always `"active"` in this file |
| `image` | String\|null | Best available image URL (resolved automatically) |
| `main_image` | Object\|null | Raw main image object with `cloudinaryId` and `url` |
| `images` | Array | All gallery images sorted by `order` ASC |
| `images[].order` | Int | Display order (1-based, sequential) |
| `createdAt` | ISO String | Creation timestamp |
| `updatedAt` | ISO String | Last update timestamp |

> Use `image` field for displaying a single image anywhere in the UI — it's already resolved to the best available URL. Only use `main_image` or `images` if you need to show a full gallery.

---

## Image Resolution Logic

The `image` field on every document is resolved using this priority:

1. If `main_image.url` is set → use it
2. Else if `images` array is non-empty → use the URL of the image with the lowest `order` value
3. Else → `null`

Always null-check before rendering an image.

---

## Recommended iOS Integration Flow

```
App Launch
    │
    ├─ Fetch detail-json/index.json
    │       └─ Compare version with cached version
    │               ├─ Same → use cached data, skip network calls
    │               └─ Different → refresh all data
    │
    ├─ Fetch detail-json/categories.json
    │       └─ Render category list / home screen using preview[]
    │
    └─ On category tap
            ├─ Fetch detail-json/data/{slug}.json  (get total_pages)
            └─ Fetch detail-json/data/{slug}/page-1.json
                    └─ On scroll to bottom + has_more == true
                            └─ Fetch next page
```

---

## Caching Strategy

- Cache all files locally (UserDefaults, CoreData, or file cache)
- Use `index.json` → `version` as a cache invalidation key
- Only re-fetch when `version` changes
- Files are regenerated server-side on demand — they don't change on a schedule

---

## Notes

- All IDs are MongoDB ObjectId strings (24-character hex)
- All timestamps are ISO 8601 UTC strings
- `image` can be `null` — always guard against this in your UI
- Documents are sorted newest first (`createdAt DESC`)
- Categories are sorted by `displayOrder ASC`, then `name ASC`
- Page size is fixed at **50 documents per page**
