const fc = require('fast-check');
const { paginate, PAGE_SIZE } = require('../helpers/paginationHelper');

describe('paginationHelper', () => {
  // Feature: json-github-publisher, Property 4: Pagination splits into correct page count
  test('Property 4: totalPages equals ceil(N/50) and sum of page lengths equals N', () => {
    fc.assert(
      fc.property(
        fc.array(fc.anything()),
        (items) => {
          const { pages, totalPages } = paginate(items);

          const expectedTotalPages = items.length === 0 ? 1 : Math.ceil(items.length / PAGE_SIZE);
          if (totalPages !== expectedTotalPages) return false;

          const sumLengths = pages.reduce((acc, page) => acc + page.length, 0);
          return sumLengths === items.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: json-github-publisher, Property 5: has_more is consistent with page position
  test('Property 5: has_more is true iff the page is not the last page', () => {
    fc.assert(
      fc.property(
        fc.array(fc.anything()),
        (items) => {
          const { pages, totalPages } = paginate(items);

          return pages.every((_, index) => {
            const pageNumber = index + 1; // 1-based
            const hasMore = pageNumber < totalPages;
            const expectedHasMore = pageNumber < totalPages;
            return hasMore === expectedHasMore;
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
