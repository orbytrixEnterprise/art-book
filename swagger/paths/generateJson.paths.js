/**
 * @swagger
 * /api/generate-json:
 *   post:
 *     summary: Generate and publish static JSON files to GitHub
 *     description: >
 *       Fetches all active categories and their active documents from MongoDB,
 *       builds a set of static JSON files in memory (index, categories, per-category
 *       data, paginated pages, and app config), and pushes every file to the configured
 *       GitHub repository via the GitHub Contents REST API.
 *       The semver patch version is auto-incremented by reading the current `index.json`
 *       from GitHub before writing. Files whose content has not changed are skipped to
 *       avoid unnecessary commits.
 *     tags: [JSON Publisher]
 *     responses:
 *       200:
 *         description: Generation and publish completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 version:
 *                   type: string
 *                   description: The new semver version written to index.json
 *                   example: "1.0.4"
 *                 files_pushed:
 *                   type: integer
 *                   description: Number of files that were created or updated on GitHub
 *                   example: 7
 *                 files_skipped:
 *                   type: integer
 *                   description: Number of files skipped because their content was unchanged
 *                   example: 2
 *                 duration_ms:
 *                   type: integer
 *                   description: Total time taken for the operation in milliseconds
 *                   example: 1842
 *       500:
 *         description: An error occurred during generation or GitHub push
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Error message describing what went wrong
 *                   example: "Missing required environment variable: GITHUB_TOKEN"
 *
 * /api/generate-full-json:
 *   post:
 *     summary: Generate and publish a single full-data JSON file to GitHub
 *     description: >
 *       Fetches all active categories and their complete active document data from MongoDB,
 *       builds a single `full-data.json` file containing every category with all its documents
 *       (full fields: title, description, status, main_image, images, timestamps), and pushes
 *       it to the GitHub repository root. Skips the push if content is unchanged.
 *     tags: [JSON Publisher]
 *     responses:
 *       200:
 *         description: Full-data file generated and published successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 file:
 *                   type: string
 *                   example: "full-data.json"
 *                 status:
 *                   type: string
 *                   enum: [pushed, skipped]
 *                   description: Whether the file was pushed or skipped (unchanged)
 *                   example: "pushed"
 *                 total_categories:
 *                   type: integer
 *                   example: 5
 *                 total_documents:
 *                   type: integer
 *                   example: 120
 *                 duration_ms:
 *                   type: integer
 *                   example: 943
 *       500:
 *         description: An error occurred during generation or GitHub push
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "GitHub pushFile failed for \"full-data.json\": HTTP 403"
 */

module.exports = {};
