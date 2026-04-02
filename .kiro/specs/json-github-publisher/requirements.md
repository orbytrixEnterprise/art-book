# Requirements Document

## Introduction

This feature adds a `POST /generate-json` endpoint to the existing Express/MongoDB backend. When called, it fetches all active categories and their active documents, generates a set of structured static JSON files (index, categories, per-category data, paginated pages, and app config), and pushes every file to a GitHub repository via the GitHub REST API. The system auto-increments the version by reading the current `index.json` from GitHub before writing, and skips pushing files whose content has not changed.

## Glossary

- **JsonGeneratorService**: Service responsible for fetching data from MongoDB and building all JSON payloads in memory.
- **GitHubService**: Service responsible for reading from and writing files to a GitHub repository via the GitHub REST API.
- **generateJsonController**: Express controller that orchestrates JsonGeneratorService and GitHubService and returns the HTTP response.
- **Active Category**: A Category document where `status === "active"`.
- **Active Document**: A Document document where `status === "active"`.
- **Preview**: The latest 3 active documents for a category, sorted by `createdAt DESC`, containing only `id`, `title`, and `image`.
- **Resolved Image**: The URL selected for a document using the image-resolution fallback logic.
- **Page Size**: Fixed at 50 documents per page.
- **Version**: A semver string stored in `index.json` on GitHub, auto-incremented on each successful generation run.

---

## Requirements

### Requirement 1: Generate JSON Endpoint

**User Story:** As an API consumer, I want to call `POST /generate-json` so that all static JSON files are regenerated and pushed to GitHub in one request.

#### Acceptance Criteria

1. THE System SHALL expose a `POST /generate-json` HTTP endpoint.
2. WHEN `POST /generate-json` is called, THE System SHALL return a `200` response with a JSON body containing `{ success: true, version, files_pushed, duration_ms }` upon successful completion.
3. IF an unhandled error occurs during generation or GitHub push, THEN THE System SHALL return a `500` response with `{ success: false, error: "<message>" }`.

---

### Requirement 2: Fetch Active Categories

**User Story:** As the JsonGeneratorService, I want to fetch only active categories so that inactive categories are excluded from all generated files.

#### Acceptance Criteria

1. WHEN fetching categories, THE JsonGeneratorService SHALL query only documents where `status === "active"`.
2. WHEN fetching categories, THE JsonGeneratorService SHALL sort results by `displayOrder ASC`, then `name ASC`.
3. WHEN fetching categories, THE JsonGeneratorService SHALL use `.lean()` and select only the fields: `_id`, `name`, `slug`, `icon`, `description`.
4. THE JsonGeneratorService SHALL convert each category `_id` ObjectId to a plain string.

---

### Requirement 3: Fetch Active Documents Per Category

**User Story:** As the JsonGeneratorService, I want to fetch active documents grouped by category so that each category's JSON files contain accurate data.

#### Acceptance Criteria

1. WHEN fetching documents, THE JsonGeneratorService SHALL query only documents where `status === "active"`.
2. WHEN fetching documents, THE JsonGeneratorService SHALL use a single bulk query across all category IDs to avoid N+1 queries.
3. WHEN fetching documents, THE JsonGeneratorService SHALL use `.lean()` and select only: `_id`, `title`, `category`, `main_image`, `images`, `createdAt`.
4. WHEN fetching documents, THE JsonGeneratorService SHALL sort results by `createdAt DESC`.
5. THE JsonGeneratorService SHALL convert each document `_id` and `category` ObjectId to a plain string.

---

### Requirement 4: Image Resolution

**User Story:** As the JsonGeneratorService, I want a consistent image URL for every document so that all JSON files have a valid or null image field.

#### Acceptance Criteria

1. WHEN resolving an image for a document, IF `main_image.url` is a non-empty string, THEN THE ImageResolver SHALL return `main_image.url`.
2. WHEN resolving an image for a document, IF `main_image.url` is absent or null AND `images` array is non-empty, THEN THE ImageResolver SHALL sort `images` by `order ASC` and return the `url` of the first element.
3. WHEN resolving an image for a document, IF both `main_image.url` is absent and `images` array is empty or absent, THEN THE ImageResolver SHALL return `null`.

---

### Requirement 5: Generate `index.json`

**User Story:** As the JsonGeneratorService, I want to produce a valid `index.json` payload so that consumers can discover all endpoints and the current version.

#### Acceptance Criteria

1. THE JsonGeneratorService SHALL produce an `index.json` payload with fields: `version` (string), `last_updated` (ISO 8601 date string), `endpoints.categories` (`"/categories.json"`), `endpoints.config` (`"/config/app-config.json"`).
2. WHEN generating `index.json`, THE JsonGeneratorService SHALL read the current `index.json` from GitHub, parse the `version` field, increment the patch number by 1, and use the result as the new version.
3. IF no `index.json` exists on GitHub yet, THEN THE JsonGeneratorService SHALL use `"1.0.0"` as the initial version.

---

### Requirement 6: Generate `categories.json`

**User Story:** As the JsonGeneratorService, I want to produce a valid `categories.json` payload so that consumers can list all active categories with preview documents.

#### Acceptance Criteria

1. THE JsonGeneratorService SHALL produce a `categories.json` payload with fields: `total` (number of active categories) and `data` (array).
2. WHEN building each category entry in `data`, THE JsonGeneratorService SHALL include: `id`, `name`, `slug`, `icon`, `description`, `total_items` (count of active documents in that category), `endpoint` (`"/data/{slug}.json"`), and `preview` (array).
3. WHEN building `preview`, THE JsonGeneratorService SHALL include the latest 3 active documents for that category sorted by `createdAt DESC`, each containing only `id`, `title`, and `image` (resolved via ImageResolver).

---

### Requirement 7: Generate `/data/{slug}.json`

**User Story:** As the JsonGeneratorService, I want to produce a per-category index file so that consumers know pagination metadata for that category.

#### Acceptance Criteria

1. THE JsonGeneratorService SHALL produce a `/data/{slug}.json` payload with fields: `category` (`{ id, name, slug }`), `total` (number of active documents), `pagination` (`{ page_size: 50, total_pages }`), and `pages` (array of page file paths).
2. WHEN building `pages`, THE JsonGeneratorService SHALL list paths in the format `"/data/{slug}/page-{n}.json"` for each page from 1 to `total_pages`.

---

### Requirement 8: Generate Paginated Page Files

**User Story:** As the JsonGeneratorService, I want to produce paginated page files so that consumers can load documents in chunks of 50.

#### Acceptance Criteria

1. THE JsonGeneratorService SHALL split all active documents for a category into pages of 50, sorted by `createdAt DESC`.
2. WHEN building each page file, THE JsonGeneratorService SHALL include: `page` (1-based page number), `has_more` (true if more pages follow), and `data` (array of `{ id, title, image }`).
3. THE JsonGeneratorService SHALL resolve `image` for each document using the ImageResolver.

---

### Requirement 9: Generate `config/app-config.json`

**User Story:** As the JsonGeneratorService, I want to produce an app config file so that clients can read feature flags and version info.

#### Acceptance Criteria

1. THE JsonGeneratorService SHALL produce a `config/app-config.json` payload with fields: `force_update` (`false`), `latest_version` (the same version string used in `index.json`), and `features` (`{ ads_enabled: true }`).

---

### Requirement 10: Push Files to GitHub

**User Story:** As the GitHubService, I want to create or update files in a GitHub repository so that the generated JSON is publicly accessible.

#### Acceptance Criteria

1. THE GitHubService SHALL read `GITHUB_TOKEN`, `GITHUB_OWNER`, and `GITHUB_REPO` from environment variables.
2. WHEN pushing a file, THE GitHubService SHALL encode the file content as Base64.
3. WHEN pushing a file, THE GitHubService SHALL call the GitHub Contents API (`PUT /repos/{owner}/{repo}/contents/{path}`).
4. WHEN a file already exists in the repository, THE GitHubService SHALL include the current file SHA in the request to perform an update.
5. WHEN a file does not exist in the repository, THE GitHubService SHALL create it without a SHA.
6. THE GitHubService SHALL use `"Auto update JSON data"` as the commit message for every file.
7. IF the GitHub API returns an error for a file, THEN THE GitHubService SHALL throw a descriptive error that includes the file path and HTTP status.

---

### Requirement 11: Skip Unchanged Files

**User Story:** As the GitHubService, I want to skip pushing files whose content has not changed so that unnecessary commits are avoided.

#### Acceptance Criteria

1. WHEN preparing to push a file, THE GitHubService SHALL fetch the current file content from GitHub.
2. IF the Base64-encoded new content equals the Base64-encoded existing content, THEN THE GitHubService SHALL skip the push for that file and log a skip message.
3. IF the content differs, THEN THE GitHubService SHALL proceed with the push.

---

### Requirement 12: Logging

**User Story:** As an operator, I want structured console logs for each step so that I can monitor and debug generation runs.

#### Acceptance Criteria

1. THE System SHALL log the start of the generation run with a timestamp.
2. THE System SHALL log each file path as it is pushed or skipped.
3. THE System SHALL log the total number of files pushed, files skipped, and total duration in milliseconds upon completion.
4. IF an error occurs, THEN THE System SHALL log the error message and stack trace before returning the error response.
