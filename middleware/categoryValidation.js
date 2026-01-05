const mongoose = require('mongoose');

/**
 * Middleware to validate category creation request body
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */
const validateCategoryCreation = (req, res, next) => {
  const { name, description, icon, status } = req.body;
  const errors = [];
   console.log(req.body);
    
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
  const { categoryOrders } = req.body;
  const errors = [];
  
  // Validate categoryOrders exists
  if (!categoryOrders) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'categoryOrders array is required',
        code: 'MISSING_CATEGORY_ORDERS'
      }
    });
  }
  
  // Validate categoryOrders is an array
  if (!Array.isArray(categoryOrders)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'categoryOrders must be an array',
        code: 'INVALID_CATEGORY_ORDERS_TYPE'
      }
    });
  }
  
  // Validate array is not empty
  if (categoryOrders.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'categoryOrders array cannot be empty',
        code: 'EMPTY_CATEGORY_ORDERS'
      }
    });
  }
  
  // Track order values and category IDs to check for duplicates
  const orderValues = new Set();
  const categoryIds = new Set();
  
  // Validate each item in categoryOrders array
  categoryOrders.forEach((item, index) => {
    // Validate item structure
    if (typeof item !== 'object' || item === null) {
      errors.push(`Item at index ${index} must be an object`);
      return;
    }
    
    // Validate categoryId
    if (!item.categoryId) {
      errors.push(`Item at index ${index} is missing categoryId`);
    } else if (typeof item.categoryId !== 'string') {
      errors.push(`Item at index ${index}: categoryId must be a string`);
    } else if (!mongoose.Types.ObjectId.isValid(item.categoryId)) {
      errors.push(`Item at index ${index}: categoryId must be a valid MongoDB ObjectId`);
    } else {
      // Check for duplicate categoryIds
      if (categoryIds.has(item.categoryId)) {
        errors.push(`Item at index ${index}: duplicate categoryId "${item.categoryId}"`);
      }
      categoryIds.add(item.categoryId);
    }
    
    // Validate displayOrder
    if (item.displayOrder === undefined || item.displayOrder === null) {
      errors.push(`Item at index ${index} is missing displayOrder`);
    } else if (typeof item.displayOrder !== 'number') {
      errors.push(`Item at index ${index}: displayOrder must be a number`);
    } else if (!Number.isInteger(item.displayOrder)) {
      errors.push(`Item at index ${index}: displayOrder must be an integer`);
    } else if (item.displayOrder < 0) {
      errors.push(`Item at index ${index}: displayOrder must be greater than or equal to 0`);
    } else {
      // Check for duplicate displayOrder values
      if (orderValues.has(item.displayOrder)) {
        errors.push(`Item at index ${index}: duplicate displayOrder value ${item.displayOrder}`);
      }
      orderValues.add(item.displayOrder);
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
