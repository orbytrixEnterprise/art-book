const mongoose = require('mongoose');

/**
 * Middleware to validate category creation request body
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */
const validateCategoryCreation = (req, res, next) => {
  const { name, description, icon, status } = req.body;
  const errors = [];
  
  // Validate name (required)
  if (!name) {
    errors.push('Category name is required');
  } else if (typeof name !== 'string') {
    errors.push('Category name must be a string');
  } else if (name.trim().length === 0) {
    errors.push('Category name cannot be empty');
  } else if (name.length > 100) {
    errors.push('Category name cannot exceed 100 characters');
  }
  
  // Validate description (optional)
  if (description !== undefined) {
    if (typeof description !== 'string') {
      errors.push('Description must be a string');
    } else if (description.length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }
  }
  
  // Validate icon (optional)
  if (icon !== undefined) {
    if (typeof icon !== 'string') {
      errors.push('Icon must be a string');
    } else if (icon.length > 10) {
      errors.push('Icon cannot exceed 10 characters');
    }
  }
  
  // Validate status (optional)
  if (status !== undefined) {
    if (typeof status !== 'string') {
      errors.push('Status must be a string');
    } else if (!['active', 'inactive'].includes(status)) {
      errors.push('Status must be either "active" or "inactive"');
    }
  }
  
  // Check for any validation errors
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors
      }
    });
  }
  
  next();
};

/**
 * Middleware to validate category update request body
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */
const validateCategoryUpdate = (req, res, next) => {
  const { name, description, icon, status } = req.body;
  const errors = [];
  
  // Check if at least one field is provided
  if (name === undefined && description === undefined && icon === undefined && status === undefined) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'At least one field (name, description, icon, or status) must be provided for update',
        code: 'NO_UPDATE_FIELDS'
      }
    });
  }
  
  // Validate name (if provided)
  if (name !== undefined) {
    if (typeof name !== 'string') {
      errors.push('Category name must be a string');
    } else if (name.trim().length === 0) {
      errors.push('Category name cannot be empty');
    } else if (name.length > 100) {
      errors.push('Category name cannot exceed 100 characters');
    }
  }
  
  // Validate description (if provided)
  if (description !== undefined) {
    if (typeof description !== 'string') {
      errors.push('Description must be a string');
    } else if (description.length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }
  }
  
  // Validate icon (if provided)
  if (icon !== undefined) {
    if (typeof icon !== 'string') {
      errors.push('Icon must be a string');
    } else if (icon.length > 10) {
      errors.push('Icon cannot exceed 10 characters');
    }
  }
  
  // Validate status (if provided)
  if (status !== undefined) {
    if (typeof status !== 'string') {
      errors.push('Status must be a string');
    } else if (!['active', 'inactive'].includes(status)) {
      errors.push('Status must be either "active" or "inactive"');
    }
  }
  
  // Check for any validation errors
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors
      }
    });
  }
  
  next();
};

/**
 * Middleware to validate category reorder request body
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */
const validateCategoryReorder = (req, res, next) => {
  const { order } = req.body;
  const errors = [];
  
  // Validate order exists
  if (!order) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Order array is required',
        code: 'MISSING_ORDER_ARRAY'
      }
    });
  }
  
  // Validate order is an array
  if (!Array.isArray(order)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Order must be an array',
        code: 'INVALID_ORDER_TYPE'
      }
    });
  }
  
  // Validate array is not empty
  if (order.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Order array cannot be empty',
        code: 'EMPTY_ORDER_ARRAY'
      }
    });
  }
  
  // Track category IDs to check for duplicates
  const categoryIds = new Set();
  
  // Validate each item in order array
  order.forEach((item, index) => {
    let categoryId;
    
    // Handle both string IDs and objects with categoryId
    if (typeof item === 'string') {
      categoryId = item;
    } else if (typeof item === 'object' && item !== null && item.categoryId) {
      categoryId = item.categoryId;
    } else {
      errors.push(`Item at index ${index} must be a valid category ID string or object with categoryId`);
      return;
    }
    
    // Validate categoryId format
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      errors.push(`Item at index ${index}: "${categoryId}" is not a valid MongoDB ObjectId`);
    } else {
      // Check for duplicate categoryIds
      if (categoryIds.has(categoryId)) {
        errors.push(`Item at index ${index}: duplicate categoryId "${categoryId}"`);
      }
      categoryIds.add(categoryId);
    }
  });
  
  // Check for any validation errors
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Category reorder validation failed',
        code: 'INVALID_REORDER_DATA',
        details: errors
      }
    });
  }
  
  next();
};

module.exports = {
  validateCategoryCreation,
  validateCategoryUpdate,
  validateCategoryReorder
};
