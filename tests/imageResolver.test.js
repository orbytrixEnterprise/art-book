const fc = require('fast-check');
const { resolveImage } = require('../helpers/imageResolver');

// Feature: json-github-publisher, Property 1: Image resolver returns main_image.url when present
describe('imageResolver', () => {
  test('Property 1: returns main_image.url when it is a non-empty string', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.array(
          fc.record({
            url: fc.string(),
            order: fc.integer(),
          })
        ),
        (url, images) => {
          const doc = { main_image: { url }, images };
          return resolveImage(doc) === url;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: json-github-publisher, Property 2: Image resolver falls back to first ordered image
  test('Property 2: falls back to the url of the image with the lowest order when main_image.url is absent', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            url: fc.string({ minLength: 1 }),
            order: fc.integer({ min: 0, max: 100 }),
          }),
          { minLength: 1 }
        ),
        (images) => {
          const doc = { main_image: { url: null }, images };
          const expected = [...images].sort((a, b) => a.order - b.order)[0].url;
          return resolveImage(doc) === expected;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: json-github-publisher, Property 3: Image resolver returns null when no images exist (edge-case)
  test('Property 3: returns null when main_image.url is absent and images array is empty or absent', () => {
    // empty images array
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(null),
          fc.constant(undefined),
          fc.constant(''),
          fc.constant(0)
        ),
        (badUrl) => {
          const docWithEmpty = { main_image: { url: badUrl }, images: [] };
          const docWithoutImages = { main_image: { url: badUrl } };
          return resolveImage(docWithEmpty) === null && resolveImage(docWithoutImages) === null;
        }
      ),
      { numRuns: 100 }
    );
  });
});
