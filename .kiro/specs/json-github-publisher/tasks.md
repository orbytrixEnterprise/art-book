# Implementation Plan: JSON GitHub Publisher

## Overview

Implement the `POST /generate-json` endpoint by building two helpers, two services, a controller, and wiring everything into the existing Express router. Tasks are ordered so each step builds on the previous and nothing is left orphaned.

## Tasks

- [x] 1. Install fast-check and add required env vars
  - Run `npm install fast-check` to add the PBT library
  - Add `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` to `.env.example`
  - _Requirements: 10.1_

- [x] 2. Implement `helpers/imageResolver.js`
  - [x] 2.1 Write `resolveImage(doc)` with all three branches
    - Branch 1: return `main_image.url` if non-empty string
    - Branch 2: sort `images` by `order ASC`, return first `url`
    - Branch 3: return `null`
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 2.2 Write property tests for imageResolver
    - **Property 1: Image resolver returns main_image.url when present**
    - **Property 2: Image resolver falls back to first ordered image**
    - **Property 3: Image resolver returns null when no images exist** (edge-case)
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [x] 3. Implement `helpers/paginationHelper.js`
  - [x] 3.1 Write `paginate(items)` returning `{ pages, totalPages }`
    - Fixed `PAGE_SIZE = 50`
    - Handle empty array (returns `{ pages: [[]], totalPages: 1 }` — one empty page)
    - _Requirements: 8.1_

  - [x] 3.2 Write property tests for paginationHelper
    - **Property 4: Pagination splits into correct page count**
    - **Property 5: has_more is consistent with page position**
    - **Validates: Requirements 8.1, 8.2**

- [x] 4. Implement `services/GitHubService.js`
  - [x] 4.1 Implement constructor — read `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` from env; throw if missing
    - _Requirements: 10.1_

  - [x] 4.2 Implement `getFile(path)` — GET `/repos/{owner}/{repo}/contents/{path}`, return `{ content, sha }` or `null` on 404
    - Use `axios` (already available via existing services pattern)
    - _Requirements: 10.4, 10.5, 11.1_

  - [x] 4.3 Implement `_encode(obj)` — `JSON.stringify(obj, null, 2)` → base64 string
    - _Requirements: 10.2_

  - [x] 4.4 Implement `_incrementVersion(version)` — parse semver, increment patch, return new string
    - _Requirements: 5.2_

  - [x] 4.5 Implement `getCurrentVersion()` — call `getFile("index.json")`, parse version, return string; default `"1.0.0"` if file missing
    - _Requirements: 5.2, 5.3_

  - [x] 4.6 Implement `pushFile(path, jsonPayload)` — encode, fetch current SHA, compare base64, skip if identical, else PUT to GitHub API; return boolean (true = pushed, false = skipped)
    - Commit message: `"Auto update JSON data"`
    - Log push or skip for each file
    - _Requirements: 10.3, 10.4, 10.5, 10.6, 10.7, 11.1, 11.2, 11.3, 12.2_

  - [x] 4.7 Write unit tests for GitHubService
    - **Property 6: Version auto-increment increments patch**
    - Test `_incrementVersion` with property test using fast-check
    - Test `getFile` returns null on 404 (example with axios mock)
    - Test `pushFile` skips when content unchanged (example with mock)
    - **Validates: Requirements 5.2, 11.2**

- [x] 5. Checkpoint — ensure helpers and GitHubService tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement `services/JsonGeneratorService.js`
  - [x] 6.1 Implement `_buildIndex(version)` — return `index.json` payload
    - _Requirements: 5.1_

  - [x] 6.2 Implement `_buildConfig(version)` — return `config/app-config.json` payload
    - _Requirements: 9.1_

  - [x] 6.3 Implement `_buildCategories(categories, docsByCategoryId)` — return `categories.json` payload
    - Use `resolveImage` for each preview document
    - Preview = first 3 items from the already-sorted docs array (sorted by `createdAt DESC`)
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 6.4 Implement `_buildCategoryIndex(category, docs)` — return `/data/{slug}.json` payload
    - _Requirements: 7.1, 7.2_

  - [x] 6.5 Implement `_buildPages(category, docs)` — return array of `[path, pagePayload]` tuples using `paginate()`
    - _Requirements: 8.1, 8.2_

  - [x] 6.6 Implement `generateAll(version)` — fetch categories and documents (single bulk query), group docs by categoryId in memory, call all builders, return `Map<path, payload>`
    - Category query: `{ status: 'active' }`, sort `{ displayOrder: 1, name: 1 }`, `.lean()`
    - Document query: `{ status: 'active', category: { $in: categoryIds } }`, sort `{ createdAt: -1 }`, `.lean()`
    - Log start, each category processed, and completion
    - _Requirements: 2.1, 2.2, 3.1, 3.4, 12.1, 12.3_

  - [x] 6.7 Write property tests for JsonGeneratorService builders
    - **Property 7: categories.json total matches data array length**
    - **Property 8: Preview contains at most 3 items**
    - **Property 9: Page data items contain only id, title, image**
    - **Validates: Requirements 6.1, 6.3, 8.2**

- [x] 7. Checkpoint — ensure JsonGeneratorService tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement `controllers/generateJsonController.js`
  - Orchestrate `GitHubService.getCurrentVersion()` → `JsonGeneratorService.generateAll()` → loop `GitHubService.pushFile()`
  - Track `pushed`, `skipped`, `duration_ms`
  - Return `200` with `{ success, version, files_pushed, files_skipped, duration_ms }`
  - Catch all errors, log with stack trace, return `500` with `{ success: false, error }`
  - _Requirements: 1.1, 1.2, 1.3, 12.1, 12.3, 12.4_

- [x] 9. Wire up the route
  - Create `routes/generateJson.js` — `router.post('/generate-json', generateJsonController)`
  - Mount in existing `routes/index.js` — `router.use('/', generateJsonRouter)`
  - _Requirements: 1.1_

- [x] 10. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- `axios` is not in `package.json` yet — `GitHubService` should use Node's built-in `fetch` (Node 18+) or add `axios` in task 1 if the Node version is older
- All ObjectId → string conversions happen inside `generateAll()` before passing to builders
- The `paginate()` helper is pure (no DB calls) making it straightforward to property-test
