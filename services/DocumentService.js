const Document = require('../models/Document');
const Category = require('../models/Category');
const cloudinaryService = require('./CloudinaryService');
const {
  CategoryError,
  createNotFoundError,
  createInactiveCategoryError,
  createInvalidIdError,
  validateCategoryId,
  handleMongooseError,
  logCategoryError
} = require('../utils/categoryErrors');

class DocumentService {
  /**
   * Validate that a category exists and is active
   * @param {String} categoryId - Category ID
   * @returns {Promise<Object>} - Category object
   * @throws {CategoryError} - If category doesn't exist or is inactive
   */
  async validateCategory(categoryId) {
    const operation = 'validateCategory';
    const context = { categoryId };
    
    try {
      validateCategoryId(categoryId);
      
      const category = await Category.findById(categoryId);
      
      if (!category) {
        throw createNotFoundError(categoryId);
      }
      
      if (category.status !== 'active') {
        throw createInactiveCategoryError(category.name);
      }
      
      return category;
    } catch (error) {
      const categoryError = handleMongooseError(error, operation);
      logCategoryError(categoryError, operation, context);
      throw categoryError;
    }
  }
  /**
   * Create a new document
   * @param {Object} data - Document data (title, description, category, status)
   * @returns {Promise<Object>} - Created document
   */
  async createDocument(data) {
    try {
      const { title, description, category, status } = data;

      // Validate that category exists and is active
      if (!category) {
        const error = new Error('Category is required');
        error.statusCode = 400;
        throw error;
      }
      
      await this.validateCategory(category);

      // Create document with provided data
      const document = new Document({
        title,
        description,
        category,
        ...(status && { status })
      });

      await document.save();
      
      // Populate category information before returning
      await document.populate('category');
      
      return document;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        throw new Error(`Validation failed: ${messages.join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Get a document by ID
   * @param {String} id - Document ID
   * @returns {Promise<Object>} - Document object with populated category
   */
  async getDocumentById(id) {
    try {
      const document = await Document.findById(id).populate('category');
      
      if (!document) {
        const error = new Error('Document not found');
        error.statusCode = 404;
        throw error;
      }

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
   * Get all documents with optional filtering
   * @param {Object} filters - Optional filters (status, category, search)
   * @returns {Promise<Array>} - Array of documents with populated category
   */
  async getAllDocuments(filters = {}) {
    try {
      const query = {};

      // Apply status filter if provided
      if (filters.status) {
        if (!['active', 'deactive'].includes(filters.status)) {
          throw new Error('Invalid status value. Must be "active" or "deactive"');
        }
        query.status = filters.status;
      }

      // Apply category filter if provided (supports both ID and slug)
      if (filters.category) {
        // Check if it's a valid ObjectId (24 character hex string)
        if (filters.category.match(/^[0-9a-fA-F]{24}$/)) {
          // Validate category exists before filtering
          try {
            validateCategoryId(filters.category);
            const categoryExists = await Category.findById(filters.category);
            if (!categoryExists) {
              throw createNotFoundError(filters.category);
            }
            query.category = filters.category;
          } catch (error) {
            if (error instanceof CategoryError) {
              throw error;
            }
            throw createNotFoundError(filters.category);
          }
        } else {
          // Filter by category slug - first find the category
          const category = await Category.findOne({ slug: filters.category });
          if (!category) {
            throw createNotFoundError(filters.category);
          }
          query.category = category._id;
        }
      }

      // Apply search filter if provided
      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const documents = await Document.find(query)
        .populate('category')
        .sort({ createdAt: -1 });
      
      return documents;
    } catch (error) {
      if (error instanceof CategoryError) {
        throw error;
      }
      throw new Error(`Failed to retrieve documents: ${error.message}`);
    }
  }

  /**
   * Update a document by ID
   * @param {String} id - Document ID
   * @param {Object} data - Update data (title, description, category, status)
   * @returns {Promise<Object>} - Updated document with populated category
   */
  async updateDocument(id, data) {
    try {
      const { title, description, category, status } = data;

      // Validate status if provided
      if (status && !['active', 'deactive'].includes(status)) {
        throw new Error('Invalid status value. Must be "active" or "deactive"');
      }

      // Validate category if being changed
      if (category !== undefined) {
        await this.validateCategory(category);
      }

      // Build update object with only provided fields
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (status !== undefined) updateData.status = status;

      // Find and update document
      const document = await Document.findByIdAndUpdate(
        id,
        updateData,
        { 
          new: true, // Return updated document
          runValidators: true // Run schema validators
        }
      ).populate('category');

      if (!document) {
        const error = new Error('Document not found');
        error.statusCode = 404;
        throw error;
      }

      return document;
    } catch (error) {
      if (error.name === 'CastError') {
        const castError = new Error('Invalid document ID format');
        castError.statusCode = 400;
        throw castError;
      }
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        throw new Error(`Validation failed: ${messages.join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Delete a document by ID with cascading image deletion
   * @param {String} id - Document ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteDocument(id) {
    try {
      // First, find the document to get image references
      const document = await Document.findById(id);

      if (!document) {
        const error = new Error('Document not found');
        error.statusCode = 404;
        throw error;
      }

      // Delete all associated images from Cloudinary if any exist
      const imagesToDelete = [];
      
      // Add main image if exists
      if (document.main_image && document.main_image.cloudinaryId) {
        imagesToDelete.push(document.main_image.cloudinaryId);
      }
      
      // Add all gallery images
      if (document.images && document.images.length > 0) {
        imagesToDelete.push(...document.images.map(img => img.cloudinaryId));
      }
      
      // Delete all images from Cloudinary
      if (imagesToDelete.length > 0) {
        try {
          await cloudinaryService.deleteBulkImages(imagesToDelete);
        } catch (cloudinaryError) {
          // Log the error but continue with document deletion
          console.error('Error deleting images from Cloudinary:', cloudinaryError.message);
          // Note: In production, you might want to handle this differently
          // e.g., queue for retry, or fail the entire operation
        }
      }

      // Delete the document from database
      await Document.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Document deleted successfully',
        deletedImages: document.images.length
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
   * Add or update main image for a document
   * @param {String} id - Document ID
   * @param {Object} file - Uploaded file
   * @returns {Promise<Object>} - Updated document
   */
  async addMainImage(id, file) {
    try {
      // Get the document
      const document = await this.getDocumentById(id);

      // If document already has a main image, delete it from Cloudinary first
      if (document.hasMainImage()) {
        try {
          await cloudinaryService.deleteImage(document.main_image.cloudinaryId);
        } catch (cloudinaryError) {
          console.error('Error deleting old main image from Cloudinary:', cloudinaryError.message);
        }
      }

      // Upload new main image to Cloudinary
      const uploadResult = await cloudinaryService.uploadImage(file);

      // Set the new main image
      document.setMainImage(uploadResult.public_id, uploadResult.secure_url);
      await document.save();

      return document;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove main image from a document
   * @param {String} id - Document ID
   * @returns {Promise<Object>} - Updated document
   */
  async removeMainImage(id) {
    try {
      // Get the document
      const document = await this.getDocumentById(id);

      // Check if document has a main image
      if (!document.hasMainImage()) {
        const error = new Error('Document does not have a main image');
        error.statusCode = 404;
        throw error;
      }

      // Delete from Cloudinary
      try {
        await cloudinaryService.deleteImage(document.main_image.cloudinaryId);
      } catch (cloudinaryError) {
        console.error('Error deleting main image from Cloudinary:', cloudinaryError.message);
      }

      // Remove main image from document
      document.removeMainImage();
      await document.save();

      return document;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update main image for a document (replace existing)
   * @param {String} id - Document ID
   * @param {Object} file - Uploaded file
   * @returns {Promise<Object>} - Updated document
   */
  async updateMainImage(id, file) {
    // This is essentially the same as addMainImage since it handles replacement
    return this.addMainImage(id, file);
  }
}

module.exports = new DocumentService();
