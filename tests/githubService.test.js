const fc = require('fast-check');

// Set env vars before loading the module so the constructor doesn't throw
process.env.GITHUB_TOKEN = 'test-token';
process.env.GITHUB_OWNER = 'test-owner';
process.env.GITHUB_REPO = 'test-repo';

// Helper to build a minimal fetch mock response
function mockFetchResponse({ status = 200, body = {} } = {}) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

describe('GitHubService', () => {
  let service;

  beforeEach(() => {
    jest.resetModules();
    service = require('../services/GitHubService');
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  // -------------------------------------------------------------------------
  // Property 6: Version auto-increment increments patch
  // Feature: json-github-publisher, Property 6: Version auto-increment increments patch
  // Validates: Requirements 5.2
  // -------------------------------------------------------------------------
  describe('_incrementVersion', () => {
    test('Property 6: for any valid semver X.Y.Z, returns X.Y.(Z+1)', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 99 }),
          fc.nat({ max: 99 }),
          fc.nat({ max: 99 }),
          (major, minor, patch) => {
            const version = `${major}.${minor}.${patch}`;
            const result = service._incrementVersion(version);
            const expected = `${major}.${minor}.${patch + 1}`;
            return result === expected;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // -------------------------------------------------------------------------
  // getFile returns null on 404
  // -------------------------------------------------------------------------
  describe('getFile', () => {
    test('returns null when GitHub responds with 404', async () => {
      global.fetch = jest.fn().mockReturnValue(mockFetchResponse({ status: 404 }));
      const result = await service.getFile('some/path.json');
      expect(result).toBeNull();
    });

    test('returns { content, sha } on success', async () => {
      global.fetch = jest.fn().mockReturnValue(
        mockFetchResponse({
          status: 200,
          body: { content: 'eyJ2ZXJzaW9uIjoiMS4wLjAifQ==', sha: 'abc123' },
        })
      );
      const result = await service.getFile('index.json');
      expect(result).toEqual({ content: 'eyJ2ZXJzaW9uIjoiMS4wLjAifQ==', sha: 'abc123' });
    });
  });

  // -------------------------------------------------------------------------
  // pushFile skips when content is unchanged
  // Validates: Requirements 11.2
  // -------------------------------------------------------------------------
  describe('pushFile', () => {
    test('returns false (skipped) when encoded content matches existing file', async () => {
      const payload = { version: '1.0.0' };
      const encoded = Buffer.from(JSON.stringify(payload, null, 2)).toString('base64');

      global.fetch = jest.fn().mockReturnValue(
        mockFetchResponse({ status: 200, body: { content: encoded, sha: 'sha-abc' } })
      );

      const pushed = await service.pushFile('index.json', payload);
      expect(pushed).toBe(false);
      // fetch should only have been called once (the getFile GET), no PUT
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('returns true (pushed) when content differs from existing file', async () => {
      const oldPayload = { version: '1.0.0' };
      const newPayload = { version: '1.0.1' };
      const oldEncoded = Buffer.from(JSON.stringify(oldPayload, null, 2)).toString('base64');

      global.fetch = jest.fn()
        .mockReturnValueOnce(
          mockFetchResponse({ status: 200, body: { content: oldEncoded, sha: 'sha-abc' } })
        )
        .mockReturnValueOnce(mockFetchResponse({ status: 200, body: {} }));

      const pushed = await service.pushFile('index.json', newPayload);
      expect(pushed).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    test('returns true (pushed) when file does not exist yet (no sha in PUT body)', async () => {
      global.fetch = jest.fn()
        .mockReturnValueOnce(mockFetchResponse({ status: 404 }))
        .mockReturnValueOnce(mockFetchResponse({ status: 201, body: {} }));

      const pushed = await service.pushFile('new/file.json', { data: 'hello' });
      expect(pushed).toBe(true);

      // Verify the PUT body does not include a sha
      const putCall = global.fetch.mock.calls[1];
      const putBody = JSON.parse(putCall[1].body);
      expect(putBody.sha).toBeUndefined();
    });
  });
});
