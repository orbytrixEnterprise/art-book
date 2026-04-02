const PAGE_SIZE = 50;

/**
 * Splits an array into pages of PAGE_SIZE.
 * An empty array returns one empty page.
 * @param {Array} items
 * @returns {{ pages: Array<Array>, totalPages: number }}
 */
function paginate(items) {
  if (!items || items.length === 0) {
    return { pages: [[]], totalPages: 1 };
  }

  const pages = [];
  for (let i = 0; i < items.length; i += PAGE_SIZE) {
    pages.push(items.slice(i, i + PAGE_SIZE));
  }

  return { pages, totalPages: pages.length };
}

module.exports = { paginate, PAGE_SIZE };
