/**
 * Resolves the display image URL for a lean document object.
 *
 * Branch 1: return main_image.url if it is a non-empty string
 * Branch 2: sort images by order ASC, return the url of the first element
 * Branch 3: return null when no image is available
 *
 * @param {Object} doc - Lean document with main_image and images fields
 * @returns {string|null}
 */
function resolveImage(doc) {
  // Branch 1: main_image.url is a non-empty string
  if (doc && doc.main_image && typeof doc.main_image.url === 'string' && doc.main_image.url.length > 0) {
    return doc.main_image.url;
  }

  // Branch 2: fall back to first image sorted by order ASC
  if (doc && Array.isArray(doc.images) && doc.images.length > 0) {
    const sorted = [...doc.images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return sorted[0].url ?? null;
  }

  // Branch 3: no image available
  return null;
}

module.exports = { resolveImage };
