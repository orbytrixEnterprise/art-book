const Document = require('../models/Document');
const cloudinaryService = require('./CloudinaryService');

class ImageService {
  /**
   * Upload a single image to a document
   * @param {String} documentId - Document ID
   * @param {Object} file - File object with buffer
   * @returns {Promise<Object>} - Updated document
   */
  async uploadSingleImage(documentId, file) {
    try {
      // Find the document
      const document = await Document.findById(documentId);
      
      if (!document) {
        const error = new Error('Document not found');
        error.statusCode = 404;
        throw error;
      }

      // Upload image to Cloudinary
      const uploadResult = await cloudinaryService.uploadImage(file.buffer, {
        folder: 'drawing-app/documents'
      });

      // Calculate order: maxOrder + 1 or 1 if empty
      const maxOrder = document.getMaxImageOrder();
      const newOrder = maxOrder + 1;

      // Add image to document
      document.images.push({
        cloudinaryId: uploadResult.cloudinaryId,
        url: uploadResult.url,
        order: newOrder
      });

      await document.save();

      return document;
    } catch (error) {
      if (error.name === 'CastError') {
        const castError = new Error('Invalid document ID format');
        castError.statusCode = 400;
        throw castError;
      }
      throw error;
    }
  }

  /**
   * Upload multiple images to a document with parallel processing
   * @param {String} documentId - Document ID
   * @param {Array} files - Array of file objects with buffers
   * @returns {Promise<Object>} - Upload results with document and status
   */
  async uploadBulkImages(documentId, files) {
    try {
      // Find the document
      const document = await Document.findById(documentId);
      
      if (!document) {
        const error = new Error('Document not found');
        error.statusCode = 404;
        throw error;
      }

      // Get starting order value
      let currentOrder = document.getMaxImageOrder();

      // Upload all images in parallel using Promise.allSettled
      const uploadPromises = files.map((file, index) => 
        cloudinaryService.uploadImage(file.buffer, {
          folder: 'drawing-app/documents'
        }).then(result => ({
          success: true,
          cloudinaryId: result.cloudinaryId,
          url: result.url,
          order: currentOrder + index + 1,
          filename: file.originalname
        })).catch(error => ({
          success: false,
          error: error.message,
          filename: file.originalname
        }))
      );

      const results = await Promise.allSettled(uploadPromises);

      // Track successful and failed uploads
      const successful = [];
      const failed = [];

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            successful.push(result.value);
            // Add successful image to document
            document.images.push({
              cloudinaryId: result.value.cloudinaryId,
              url: result.value.url,
              order: result.value.order
            });
          } else {
            failed.push({
              filename: result.value.filename,
              error: result.value.error
            });
          }
        } else {
          failed.push({
            filename: 'unknown',
            error: result.reason?.message || 'Unknown error'
          });
        }
      });

      // Save document with successful uploads
      if (successful.length > 0) {
        await document.save();
      }

      return {
        document,
        uploadResults: {
          successful: successful.length,
          failed: failed.length,
          failures: failed
        }
      };
    } catch (error) {
      if (error.name === 'CastError') {
        const castError = new Error('Invalid document ID format');
        castError.statusCode = 400;
        throw castError;
      }
      throw error;
    }
  }

  /**
   * Remove a single image from a document with Cloudinary deletion and order resequencing
   * @param {String} documentId - Document ID
   * @param {String} imageId - Image ID within the document
   * @returns {Promise<Object>} - Updated document
   */
  async removeImage(documentId, imageId) {
    try {
      // Find the document
      const document = await Document.findById(documentId);
      
      if (!document) {
        const error = new Error('Document not found');
        error.statusCode = 404;
        throw error;
      }

      // Find the image
      const image = document.images.find(img => img._id.toString() === imageId);
      
      if (!image) {
        const error = new Error('Image not found');
        error.statusCode = 404;
        throw error;
      }

      // Delete from Cloudinary
      await cloudinaryService.deleteImage(image.cloudinaryId);

      // Remove image from document and reorder
      document.removeImage(imageId);

      await document.save();

      return document;
    } catch (error) {
      if (error.name === 'CastError') {
        const castError = new Error('Invalid document ID format');
        castError.statusCode = 400;
        throw castError;
      }
      throw error;
    }
  }

  /**
   * Remove multiple images from a document
   * @param {String} documentId - Document ID
   * @param {Array<String>} imageIds - Array of image IDs to remove
   * @returns {Promise<Object>} - Updated document
   */
  async removeMultipleImages(documentId, imageIds) {
    try {
      // Find the document
      const document = await Document.findById(documentId);
      
      if (!document) {
        const error = new Error('Document not found');
        error.statusCode = 404;
        throw error;
      }

      // Find all images to remove and collect their Cloudinary IDs
      const cloudinaryIds = [];
      const validImageIds = [];

      imageIds.forEach(imageId => {
        const image = document.images.find(img => img._id.toString() === imageId);
        if (image) {
          cloudinaryIds.push(image.cloudinaryId);
          validImageIds.push(imageId);
        }
      });

      if (cloudinaryIds.length === 0) {
        const error = new Error('No valid images found to remove');
        error.statusCode = 404;
        throw error;
      }

      // Delete from Cloudinary in bulk
      await cloudinaryService.deleteBulkImages(cloudinaryIds);

      // Remove images from document
      validImageIds.forEach(imageId => {
        const imageIndex = document.images.findIndex(img => img._id.toString() === imageId);
        if (imageIndex !== -1) {
          document.images.splice(imageIndex, 1);
        }
      });

      // Reorder remaining images
      document.reorderImagesSequentially();

      await document.save();

      return document;
    } catch (error) {
      if (error.name === 'CastError') {
        const castError = new Error('Invalid document ID format');
        castError.statusCode = 400;
        throw castError;
      }
      throw error;
    }
  }

  /**
   * Reorder images within a document with validation
   * @param {String} documentId - Document ID
   * @param {Array<Object>} imageOrders - Array of {imageId, order} objects
   * @returns {Promise<Object>} - Updated document
   */
  async reorderImages(documentId, imageOrders) {
    try {
      // Find the document
      const document = await Document.findById(documentId);
      
      if (!document) {
        const error = new Error('Document not found');
        error.statusCode = 404;
        throw error;
      }

      // Validate that all imageIds exist in the document
      const documentImageIds = document.images.map(img => img._id.toString());
      const providedImageIds = imageOrders.map(item => item.imageId);

      const invalidIds = providedImageIds.filter(id => !documentImageIds.includes(id));
      if (invalidIds.length > 0) {
        const error = new Error(`Invalid image IDs: ${invalidIds.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }

      // Validate that all order values are unique
      const orderValues = imageOrders.map(item => item.order);
      const uniqueOrders = new Set(orderValues);
      
      if (orderValues.length !== uniqueOrders.size) {
        const error = new Error('Order values must be unique');
        error.statusCode = 400;
        throw error;
      }

      // Validate that order values are positive integers
      const invalidOrders = orderValues.filter(order => !Number.isInteger(order) || order < 1);
      if (invalidOrders.length > 0) {
        const error = new Error('Order values must be positive integers');
        error.statusCode = 400;
        throw error;
      }

      // Update image orders
      document.updateImageOrders(imageOrders);

      await document.save();

      return document;
    } catch (error) {
      if (error.name === 'CastError') {
        const castError = new Error('Invalid document ID format');
        castError.statusCode = 400;
        throw castError;
      }
      throw error;
    }
  }

  /**
   * Get all images for a specific document
   * @param {String} documentId - Document ID
   * @returns {Promise<Array>} - Array of images sorted by order
   */
  async getDocumentImages(documentId) {
    try {
      // Find the document
      const document = await Document.findById(documentId);
      
      if (!document) {
        const error = new Error('Document not found');
        error.statusCode = 404;
        throw error;
      }

      // Return images sorted by order
      return document.getOrderedImages();
    } catch (error) {
      if (error.name === 'CastError') {
        const castError = new Error('Invalid document ID format');
        castError.statusCode = 400;
        throw castError;
      }
      throw error;
    }
  }

  /**
   * Get images from multiple documents with document grouping
   * @param {Array<String>} documentIds - Array of document IDs
   * @returns {Promise<Object>} - Images grouped by document ID
   */
  async getMultiDocumentImages(documentIds) {
    try {
      // Validate input
      if (!Array.isArray(documentIds) || documentIds.length === 0) {
        const error = new Error('Array of document IDs is required');
        error.statusCode = 400;
        throw error;
      }

      // Fetch all documents
      const documents = await Document.find({
        _id: { $in: documentIds }
      });

      // Create a map of found document IDs
      const foundDocumentIds = new Set(documents.map(doc => doc._id.toString()));

      // Identify invalid document IDs
      const invalidIds = documentIds.filter(id => !foundDocumentIds.has(id));

      // Group images by document ID
      const groupedImages = {};

      documents.forEach(document => {
        groupedImages[document._id.toString()] = {
          documentId: document._id,
          title: document.title,
          images: document.getOrderedImages()
        };
      });

      // Add empty arrays for documents with no images or not found
      documentIds.forEach(docId => {
        if (!groupedImages[docId]) {
          groupedImages[docId] = {
            documentId: docId,
            title: null,
            images: []
          };
        }
      });

      return {
        documents: groupedImages,
        invalidIds: invalidIds.length > 0 ? invalidIds : undefined
      };
    } catch (error) {
      throw new Error(`Failed to retrieve multi-document images: ${error.message}`);
    }
  }
}

module.exports = new ImageService();
