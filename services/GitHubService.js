class GitHubService {
  constructor() {
    const missing = ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO'].filter(
      (key) => !process.env[key]
    );
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    this.token = process.env.GITHUB_TOKEN;
    this.owner = process.env.GITHUB_OWNER;
    this.repo = process.env.GITHUB_REPO;
    this.baseUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/contents`;
    this.headers = {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  /**
   * Fetch a file from the GitHub repository.
   * @param {string} path - File path within the repo
   * @returns {Promise<{content: string, sha: string}|null>} - File info or null if not found
   */
  async getFile(path) {
    const res = await fetch(`${this.baseUrl}/${path}`, { headers: this.headers });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`GitHub getFile failed for "${path}": HTTP ${res.status}`);
    }
    const data = await res.json();
    return { content: data.content, sha: data.sha };
  }

  /**
   * Encode a JSON object to a base64 string.
   * @param {Object} obj
   * @returns {string}
   */
  _encode(obj) {
    return Buffer.from(JSON.stringify(obj, null, 2)).toString('base64');
  }

  /**
   * Increment the patch segment of a semver string.
   * @param {string} version - e.g. "1.0.3"
   * @returns {string} - e.g. "1.0.4"
   */
  _incrementVersion(version) {
    const parts = version.split('.');
    const patch = parseInt(parts[2], 10);
    parts[2] = String(patch + 1);
    return parts.join('.');
  }

  /**
   * Read the current version from index.json on GitHub.
   * Defaults to "1.0.0" if the file does not exist yet.
   * @returns {Promise<string>}
   */
  async getCurrentVersion() {
    const file = await this.getFile('index.json');
    if (!file) return '1.0.0';
    const raw = Buffer.from(file.content, 'base64').toString('utf8');
    const parsed = JSON.parse(raw);
    return parsed.version || '1.0.0';
  }

  /**
   * Push a JSON payload to a file in the GitHub repository.
   * Skips the push if the encoded content is identical to what is already on GitHub.
   * @param {string} path - File path within the repo
   * @param {Object} jsonPayload - Object to serialise and push
   * @returns {Promise<boolean>} - true if pushed, false if skipped
   */
  async pushFile(path, jsonPayload) {
    const encoded = this._encode(jsonPayload);
    const existing = await this.getFile(path);

    if (existing) {
      // GitHub returns content with embedded newlines; strip them for comparison
      const existingContent = existing.content.replace(/\n/g, '');
      if (existingContent === encoded) {
        console.log(`[GitHubService] Skipped (unchanged): ${path}`);
        return false;
      }
    }

    const body = JSON.stringify({
      message: 'Auto update JSON data',
      content: encoded,
      ...(existing ? { sha: existing.sha } : {}),
    });

    const res = await fetch(`${this.baseUrl}/${path}`, {
      method: 'PUT',
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body,
    });

    if (!res.ok) {
      throw new Error(`GitHub pushFile failed for "${path}": HTTP ${res.status}`);
    }

    console.log(`[GitHubService] Pushed: ${path}`);
    return true;
  }
}

module.exports = new GitHubService();
