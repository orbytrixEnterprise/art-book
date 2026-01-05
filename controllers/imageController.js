const imageService = require('../services/ImageService');

/**
 * Upload a single image to a document
 * @route POST /api/documents/:id/images
 */
const uploadSingleImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Image file is required',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const document = await imageService.uploadSingleImage(id, req.file);

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

    // Handle Cloudinary failures
    if (error.message && error.message.includes('Cloudinary')) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to upload image to cloud storage',
          code: 'CLOUDINARY_ERROR',
          details: error.message
        }
      });
    }

    next(error);
  }
};

/**
 * Upload multiple images to a document
 * @route POST /api/documents/:id/images/bulk
 */
const uploadBulkImages = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate files exist
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'At least one image file is required',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const result = await imageService.uploadBulkImages(id, req.files);

    res.status(200).json({
      success: true,
      data: {
        document: result.document,
        uploadResults: result.uploadResults
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

    // Handle Cloudinary failures
    if (error.message && error.message.includes('Cloudinary')) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to upload images to cloud storage',
          code: 'CLOUDINARY_ERROR',
          details: error.message
        }
      });
    }

    next(error);
  }
};

/**
 * Remove a single image from a document
 * @route DELETE /api/documents/:id/images/:imageId
 */
const removeImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;

    const document = await imageService.removeImage(id, imageId);

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

    // Handle Cloudinary failures
    if (error.message && error.message.includes('Cloudinary')) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete image from cloud storage',
          code: 'CLOUDINARY_ERROR',
          details: error.message
        }
      });
    }

    next(error);
  }
};

/**
 * Remove multiple images from a document
 * @route DELETE /api/documents/:id/images
 */
const removeMultipleImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageIds } = req.body;

    // Validate imageIds array
    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Array of image IDs is required',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const document = await imageService.removeMultipleImages(id, imageIds);

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

    // Handle Cloudinary failures
    if (error.message && error.message.includes('Cloudinary')) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete images from cloud storage',
          code: 'CLOUDINARY_ERROR',
          details: error.message
        }
      });
    }

    next(error);
  }
};

/**
 * Reorder images within a document
 * @route PUT /api/documents/:id/images/reorder
 */
const reorderImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageOrders } = req.body;

    // Validate imageOrders array
    if (!imageOrders || !Array.isArray(imageOrders) || imageOrders.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Array of image orders is required',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Validate each item has imageId and order
    const invalidItems = imageOrders.filter(item => !item.imageId || typeof item.order !== 'number');
    if (invalidItems.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Each item must have imageId and order properties',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const document = await imageService.reorderImages(id, imageOrders);

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

    // Handle invalid ID format or validation errors
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
 * Get all images for a specific document
 * @route GET /api/documents/:id/images
 */
const getDocumentImages = async (req, res, next) => {
  try {
    const { id } = req.params;

    const images = await imageService.getDocumentImages(id);

    res.status(200).json({
      success: true,
      data: images
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
 * Get images from multiple documents
 * @route POST /api/images/multi-document
 */
const getMultiDocumentImages = async (req, res, next) => {
  try {
    const { documentIds } = req.body;

    // Validate documentIds array
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Array of document IDs is required',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const result = await imageService.getMultiDocumentImages(documentIds);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    // Handle validation errors
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
  uploadSingleImage,
  uploadBulkImages,
  removeImage,
  removeMultipleImages,
  reorderImages,
  getDocumentImages,
  getMultiDocumentImages
};
