const fc = require('fast-check');

// Require the class directly (not the singleton) so we can instantiate without env vars
const JsonGeneratorService = require('../services/JsonGeneratorService');

// Arbitraries
const arbObjectId = () =>
  fc.stringMatching(/^[0-9a-f]{24}$/).map((s) => ({
    toString: () => s,
  }));

const arbDoc = () =>
  fc.record({
    _id: arbObjectId(),
    title: fc.string({ minLength: 1 }),
    main_image: fc.record({ url: fc.option(fc.string({ minLength: 1 }), { nil: null }) }),
    images: fc.array(
      fc.record({
        url: fc.string({ minLength: 1 }),
        order: fc.integer({ min: 0, max: 100 }),
      })
    ),
    createdAt: fc.date(),
  });

const arbCategory = () =>
  fc.record({
    _id: arbObjectId(),
    name: fc.string({ minLength: 1 }),
    slug: fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/),
    icon: fc.string(),
    description: fc.string(),
  });

// Feature: json-github-publisher, Property 7: categories.json total matches data array length
describe('JsonGeneratorService._buildCategories', () => {
  test('Property 7: total equals data.length for any set of categories', () => {
    fc.assert(
      fc.property(
        fc.array(arbCategory(), { minLength: 0, maxLength: 20 }),
        fc.array(arbDoc(), { minLength: 0, maxLength: 100 }),
        (categories, docs) => {
          // Build docsByCategoryId map
          const docsByCategoryId = new Map();
          categories.forEach((cat) => {
            const catId = cat._id.toString();
            docsByCategoryId.set(catId, []);
          });
          docs.forEach((doc, i) => {
            if (categories.length > 0) {
              const cat = categories[i % categories.length];
              const catId = cat._id.toString();
              docsByCategoryId.get(catId).push(doc);
            }
          });

          const result = JsonGeneratorService._buildCategories(categories, docsByCategoryId);
          return result.total === result.data.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: json-github-publisher, Property 8: Preview contains at most 3 items
  test('Property 8: preview.length <= 3 for every category entry', () => {
    fc.assert(
      fc.property(
        fc.array(arbCategory(), { minLength: 1, maxLength: 10 }),
        fc.array(arbDoc(), { minLength: 0, maxLength: 50 }),
        (categories, docs) => {
          const docsByCategoryId = new Map();
          categories.forEach((cat) => {
            docsByCategoryId.set(cat._id.toString(), []);
          });
          docs.forEach((doc, i) => {
            const cat = categories[i % categories.length];
            docsByCategoryId.get(cat._id.toString()).push(doc);
          });

          const result = JsonGeneratorService._buildCategories(categories, docsByCategoryId);
          return result.data.every((entry) => entry.preview.length <= 3);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: json-github-publisher, Property 9: Page data items contain only id, title, image
describe('JsonGeneratorService._buildPages', () => {
  test('Property 9: every item in page data has exactly the keys id, title, image', () => {
    fc.assert(
      fc.property(
        arbCategory(),
        fc.array(arbDoc(), { minLength: 0, maxLength: 200 }),
        (category, docs) => {
          const pages = JsonGeneratorService._buildPages(category, docs);
          for (const [, payload] of pages) {
            for (const item of payload.data) {
              const keys = Object.keys(item).sort();
              if (keys.join(',') !== 'id,image,title') return false;
            }
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
