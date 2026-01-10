const documentService = require('../services/DocumentService');
const { CategoryError, formatErrorResponse } = require('../utils/categoryErrors');

/**
 * Create a new document
 * @route POST /api/documents
 */
const createDocument = async (req, res, next) => {
  try {
    const { title, description, category, status } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Title and description are required',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Validate category is required
    if (!category) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Category is required',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Validate status if provided
    if (status && !['active', 'deactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Status must be either "active" or "deactive"',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const document = await documentService.createDocument({ title, description, category, status });

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    // Handle CategoryError instances with structured error responses
    if (error instanceof CategoryError) {
      return res.status(error.statusCode).json(formatErrorResponse(error));
    }

    next(error);
  }
};

/**
 * Get a document by ID
 * @route GET /api/documents/:id
 */
const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await documentService.getDocumentById(id);

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    // Handle 404 errors
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: {
          message: error.message,
          code: 'NOT_FOUND'
        }
      });
    }

    // Handle invalid ID format
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'VALIDATION_ERROR'
        }
      });
    }

    next(error);
  }
};

/**
 * Get all documents with optional status, category, and search filtering
 * @route GET /api/documents
 */
const getAllDocuments = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;

    // Build filters object
    const filters = {};
    if (status) {
      filters.status = status;
    }
    if (category) {
      filters.category = category;
    }
    if (search) {
      filters.search = search;
    }

    const documents = await documentService.getAllDocuments(filters);

    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    // Handle CategoryError instances with structured error responses
    if (error instanceof CategoryError) {
      return res.status(error.statusCode).json(formatErrorResponse(error));
    }

    next(error);
  }
};

/**
 * Update a document by ID
 * @route PUT /api/documents/:id
 */
const updateDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, status } = req.body;

    // Validate that at least one field is provided
    if (!title && !description && !category && !status) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'At least one field (title, description, category, or status) must be provided',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Validate status if provided
    if (status && !['active', 'deactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Status must be either "active" or "deactive"',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const document = await documentService.updateDocument(id, { title, description, category, status });

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    // Handle CategoryError instances with structured error responses
    if (error instanceof CategoryError) {
      return res.status(error.statusCode).json(formatErrorResponse(error));
    }

    // Handle 404 errors
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: {
          message: error.message,
          code: 'NOT_FOUND'
        }
      });
    }

    // Handle invalid ID format
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'VALIDATION_ERROR'
        }
      });
    }

    next(error);
  }
};

/**
 * Delete a document by ID
 * @route DELETE /api/documents/:id
 */
const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await documentService.deleteDocument(id);

    res.status(200).json({
      success: true,
      data: {
        message: result.message,
        deletedImages: result.deletedImages
      }
    });
  } catch (error) {
    // Handle 404 errors
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: {
          message: error.message,
          code: 'NOT_FOUND'
        }
      });
    }

    // Handle invalid ID format
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'VALIDATION_ERROR'
        }
      });
    }

    next(error);
  }
};

/**
 * Add or update main image for a document
 * @route POST /api/documents/:id/main-image
 */
const addMainImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No image file provided',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const document = await documentService.addMainImage(id, req.file);

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    // Handle 404 errors
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: {
          message: error.message,
          code: 'NOT_FOUND'
        }
      });
    }

    // Handle invalid ID format
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'VALIDATION_ERROR'
        }
      });
    }

    next(error);
  }
};

/**
 * Update main image for a document
 * @route PUT /api/documents/:id/main-image
 */
const updateMainImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No image file provided',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const document = await documentService.updateMainImage(id, req.file);

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    // Handle 404 errors
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: {
          message: error.message,
          code: 'NOT_FOUND'
        }
      });
    }

    // Handle invalid ID format
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'VALIDATION_ERROR'
        }
      });
    }

    next(error);
  }
};

/**
 * Remove main image from a document
 * @route DELETE /api/documents/:id/main-image
 */
const removeMainImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await documentService.removeMainImage(id);

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    // Handle 404 errors
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: {
          message: error.message,
          code: 'NOT_FOUND'
        }
      });
    }

    // Handle invalid ID format
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'VALIDATION_ERROR'
        }
      });
    }

    next(error);
  }
};

module.exports = {
  createDocument,
  getDocumentById,
  getAllDocuments,
  updateDocument,
  deleteDocument,
  addMainImage,
  updateMainImage,
  removeMainImage
};
