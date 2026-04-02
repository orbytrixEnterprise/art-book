const Category = require('../models/Category');
const Document = require('../models/Document');
const { resolveImage } = require('../helpers/imageResolver');
const { paginate } = require('../helpers/paginationHelper');

class JsonGeneratorService {
  /**
   * Build the index.json payload.
   * @param {string} version - Semver version string
   * @returns {Object}
   */
  _buildIndex(version) {
    return {
      version,
      last_updated: new Date().toISOString(),
      endpoints: {
        categories: '/categories.json',
        config: '/config/app-config.json',
      },
    };
  }

  /**
   * Build the config/app-config.json payload.
   * @param {string} version - Semver version string
   * @returns {Object}
   */
  _buildConfig(version) {
    return {
      force_update: false,
      latest_version: version,
      features: {
        ads_enabled: true,
      },
    };
  }

  /**
   * Build the categories.json payload.
   * @param {Array} categories - Lean category objects
   * @param {Map<string, Array>} docsByCategoryId - Docs grouped by category id string
   * @returns {Object}
   */
  _buildCategories(categories, docsByCategoryId) {
    const data = categories.map((cat) => {
      const catId = cat._id.toString();
      const docs = docsByCategoryId.get(catId) || [];
      const preview = docs.slice(0, 3).map((doc) => ({
        id: doc._id.toString(),
        title: doc.title,
        image: resolveImage(doc),
      }));

      return {
        id: catId,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        total_items: docs.length,
        endpoint: `/data/${cat.slug}.json`,
        preview,
      };
    });

    return {
      total: data.length,
      data,
    };
  }

  /**
   * Build the /data/{slug}.json payload for a single category.
   * @param {Object} category - Lean category object
   * @param {Array} docs - Sorted docs for this category
   * @returns {Object}
   */
  _buildCategoryIndex(category, docs) {
    const { totalPages } = paginate(docs);
    const pages = Array.from({ length: totalPages }, (_, i) => `/data/${category.slug}/page-${i + 1}.json`);

    return {
      category: {
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
      },
      total: docs.length,
      pagination: {
        page_size: 50,
        total_pages: totalPages,
      },
      pages,
    };
  }

  /**
   * Build paginated page file tuples for a category.
   * @param {Object} category - Lean category object
   * @param {Array} docs - Sorted docs for this category
   * @returns {Array<[string, Object]>} - Array of [path, payload] tuples
   */
  _buildPages(category, docs) {
    const { pages, totalPages } = paginate(docs);

    return pages.map((pageItems, idx) => {
      const pageNum = idx + 1;
      const path = `data/${category.slug}/page-${pageNum}.json`;
      const payload = {
        page: pageNum,
        has_more: pageNum < totalPages,
        data: pageItems.map((doc) => ({
          id: doc._id.toString(),
          title: doc.title,
          image: resolveImage(doc),
        })),
      };
      return [path, payload];
    });
  }

  /**
   * Fetch all active categories and their full document data,
   * and return a single combined payload grouped by category.
   * @returns {Promise<Object>}
   */
  async generateFullData() {
    console.log(`[JsonGeneratorService] Starting full-data generation at ${new Date().toISOString()}`);

    const categories = await Category.find({ status: 'active' })
      .select('_id name slug icon description')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const categoryIds = categories.map((c) => c._id);

    const documents = await Document.find({
      status: 'active',
      category: { $in: categoryIds },
    })
      .select('_id title description category main_image images createdAt updatedAt status')
      .sort({ createdAt: -1 })
      .lean();

    const docsByCategoryId = new Map();
    for (const doc of documents) {
      const catId = doc.category.toString();
      if (!docsByCategoryId.has(catId)) docsByCategoryId.set(catId, []);
      docsByCategoryId.get(catId).push(doc);
    }

    const data = categories.map((cat) => {
      const catId = cat._id.toString();
      const docs = docsByCategoryId.get(catId) || [];

      return {
        id: catId,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        total_items: docs.length,
        documents: docs.map((doc) => ({
          id: doc._id.toString(),
          title: doc.title,
          description: doc.description,
          status: doc.status,
          main_image: doc.main_image || null,
          images: (doc.images || [])
            .sort((a, b) => a.order - b.order)
            .map((img) => ({ id: img._id.toString(), url: img.url, order: img.order })),
          image: resolveImage(doc),
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        })),
      };
    });

    console.log(`[JsonGeneratorService] Full-data generation complete — ${categories.length} categories`);

    return {
      generated_at: new Date().toISOString(),
      total_categories: categories.length,
      total_documents: documents.length,
      data,
    };
  }


  /**
   * Fetch all active categories and documents, build all JSON payloads,
   * and return a Map of file path → payload.
   * @param {string} version - Semver version string
   * @returns {Promise<Map<string, Object>>}
   */
  async generateAll(version) {
    console.log(`[JsonGeneratorService] Starting generation run at ${new Date().toISOString()}`);

    // Fetch active categories
    const categories = await Category.find({ status: 'active' })
      .select('_id name slug icon description')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const categoryIds = categories.map((c) => c._id);

    // Single bulk document query — avoids N+1
    const documents = await Document.find({
      status: 'active',
      category: { $in: categoryIds },
    })
      .select('_id title category main_image images createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Group docs by category id string in memory
    const docsByCategoryId = new Map();
    for (const doc of documents) {
      const catId = doc.category.toString();
      if (!docsByCategoryId.has(catId)) {
        docsByCategoryId.set(catId, []);
      }
      docsByCategoryId.get(catId).push(doc);
    }

    const files = new Map();

    // detail-json/index.json
    files.set('detail-json/index.json', this._buildIndex(version));

    // detail-json/config/app-config.json
    files.set('detail-json/config/app-config.json', this._buildConfig(version));

    // detail-json/categories.json
    files.set('detail-json/categories.json', this._buildCategories(categories, docsByCategoryId));

    // Per-category files
    for (const category of categories) {
      const catId = category._id.toString();
      const docs = docsByCategoryId.get(catId) || [];

      console.log(`[JsonGeneratorService] Processing category: ${category.slug} (${docs.length} docs)`);

      // detail-json/data/{slug}.json
      files.set(`detail-json/data/${category.slug}.json`, this._buildCategoryIndex(category, docs));

      // detail-json/data/{slug}/page-{n}.json
      for (const [path, payload] of this._buildPages(category, docs)) {
        files.set(`detail-json/${path}`, payload);
      }
    }

    console.log(`[JsonGeneratorService] Generation complete — ${files.size} files built`);
    return files;
  }
}

module.exports = new JsonGeneratorService();
