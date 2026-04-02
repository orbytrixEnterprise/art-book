const githubService = require('../services/GitHubService');
const jsonGeneratorService = require('../services/JsonGeneratorService');

/**
 * POST /generate-json
 * Orchestrates JSON generation and GitHub publishing.
 */
const generateJson = async (req, res) => {
  const start = Date.now();
  console.log(`[generate-json] Generation run started at ${new Date().toISOString()}`);

  try {
    const version = await githubService.getCurrentVersion();
    const files = await jsonGeneratorService.generateAll(version);

    let pushed = 0;
    let skipped = 0;

    for (const [path, payload] of files) {
      const changed = await githubService.pushFile(path, payload);
      if (changed) pushed++;
      else skipped++;
    }

    const duration_ms = Date.now() - start;
    console.log(
      `[generate-json] Complete — pushed: ${pushed}, skipped: ${skipped}, duration: ${duration_ms}ms`
    );

    return res.status(200).json({
      success: true,
      version,
      files_pushed: pushed,
      files_skipped: skipped,
      duration_ms,
    });
  } catch (err) {
    console.error('[generate-json] error:', err.message);
    console.error(err.stack);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * POST /generate-full-json
 * Builds a single JSON file with all active categories and their full document data,
 * then pushes it to GitHub at full-data.json.
 */
const generateFullJson = async (req, res) => {
  const start = Date.now();
  console.log(`[generate-full-json] Run started at ${new Date().toISOString()}`);

  try {
    const payload = await jsonGeneratorService.generateFullData();
    const changed = await githubService.pushFile('full-data.json', payload);

    const duration_ms = Date.now() - start;
    console.log(`[generate-full-json] Complete — ${changed ? 'pushed' : 'skipped (unchanged)'}, duration: ${duration_ms}ms`);

    return res.status(200).json({
      success: true,
      file: 'full-data.json',
      status: changed ? 'pushed' : 'skipped',
      total_categories: payload.total_categories,
      total_documents: payload.total_documents,
      duration_ms,
    });
  } catch (err) {
    console.error('[generate-full-json] error:', err.message);
    console.error(err.stack);
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { generateJson, generateFullJson };
