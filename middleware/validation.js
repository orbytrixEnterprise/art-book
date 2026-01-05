const mongoose = require('mongoose');

/**
 * Middleware to validate MongoDB ObjectId parameters
 * @param {string} paramName - The name of the parameter to validate (default: 'id')
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          message: `${paramName} parameter is required`,
          code: 'MISSING_PARAMETER'
        }
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid ${paramName}. Must be a valid MongoDB ObjectId`,
          code: 'INVALID_OBJECT_ID'
        }
      });
    }
    
    next();
  };
};

/**
 * Middleware to validate document creation request body
 */
const validateDocumentCreation = (req, res, next) => {
  const { title, description, status, category } = req.body;
  const errors = [];
  
  // Validate title
  if (!title) {
    errors.push('Title is required');
  } else if (typeof title !== 'string') {
    errors.push('Title must be a string');
  } else if (title.trim().length === 0) {
    errors.push('Title cannot be empty');
  } else if (title.length > 200) {
    errors.push('Title cannot exceed 200 characters');
  }
  
  // Validate description
  if (!description) {
    errors.push('Description is required');
  } else if (typeof description !== 'string') {
    errors.push('Description must be a string');
  } else if (description.trim().length === 0) {
    errors.push('Description cannot be empty');
  } else if (description.length > 2000) {
    errors.push('Description cannot exceed 2000 characters');
  }
  
  // Validate category (required)
  if (!category) {
    errors.push('Category is required');
  } else if (typeof category !== 'string') {
    errors.push('Category must be a string');
  } else if (!mongoose.Types.ObjectId.isValid(category)) {
    errors.push('Category must be a valid MongoDB ObjectId');
  }
  
  // Validate status (optional)
  if (status !== undefined) {
    if (typeof status !== 'string') {
      errors.push('Status must be a string');
    } else if (!['active', 'deactive'].includes(status)) {
      errors.push('Status must be either "active" or "deactive"');
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
 * Middleware to validate document update request body
 */
const validateDocumentUpdate = (req, res, next) => {
  const { title, description, status, category } = req.body;
  const errors = [];
  
  // Check if at least one field is provided
  if (title === undefined && description === undefined && status === undefined && category === undefined) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'At least one field (title, description, status, or category) must be provided for update',
        code: 'NO_UPDATE_FIELDS'
      }
    });
  }
  
  // Validate title (if provided)
  if (title !== undefined) {
    if (typeof title !== 'string') {
      errors.push('Title must be a string');
    } else if (title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (title.length > 200) {
      errors.push('Title cannot exceed 200 characters');
    }
  }
  
  // Validate description (if provided)
  if (description !== undefined) {
    if (typeof description !== 'string') {
      errors.push('Description must be a string');
    } else if (description.trim().length === 0) {
      errors.push('Description cannot be empty');
    } else if (description.length > 2000) {
      errors.push('Description cannot exceed 2000 characters');
    }
  }
  
  // Validate category (if provided)
  if (category !== undefined) {
    if (typeof category !== 'string') {
      errors.push('Category must be a string');
    } else if (!mongoose.Types.ObjectId.isValid(category)) {
      errors.push('Category must be a valid MongoDB ObjectId');
    }
  }
  
  // Validate status (if provided)
  if (status !== undefined) {
    if (typeof status !== 'string') {
      errors.push('Status must be a string');
    } else if (!['active', 'deactive'].includes(status)) {
      errors.push('Status must be either "active" or "deactive"');
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
 * Middleware to validate image reorder request body
 */
const validateImageReorder = (req, res, next) => {
  const { imageOrders } = req.body;
  const errors = [];
  
  // Validate imageOrders exists
  if (!imageOrders) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'imageOrders array is required',
        code: 'MISSING_IMAGE_ORDERS'
      }
    });
  }
  
  // Validate imageOrders is an array
  if (!Array.isArray(imageOrders)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'imageOrders must be an array',
        code: 'INVALID_IMAGE_ORDERS_TYPE'
      }
    });
  }
  
  // Validate array is not empty
  if (imageOrders.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'imageOrders array cannot be empty',
        code: 'EMPTY_IMAGE_ORDERS'
      }
    });
  }
  
  // Track order values to check for duplicates
  const orderValues = new Set();
  const imageIds = new Set();
  
  // Validate each item in imageOrders array
  imageOrders.forEach((item, index) => {
    // Validate item structure
    if (typeof item !== 'object' || item === null) {
      errors.push(`Item at index ${index} must be an object`);
      return;
    }
    
    // Validate imageId
    if (!item.imageId) {
      errors.push(`Item at index ${index} is missing imageId`);
    } else if (typeof item.imageId !== 'string') {
      errors.push(`Item at index ${index}: imageId must be a string`);
    } else if (!mongoose.Types.ObjectId.isValid(item.imageId)) {
      errors.push(`Item at index ${index}: imageId must be a valid MongoDB ObjectId`);
    } else {
      // Check for duplicate imageIds
      if (imageIds.has(item.imageId)) {
        errors.push(`Item at index ${index}: duplicate imageId "${item.imageId}"`);
      }
      imageIds.add(item.imageId);
    }
    
    // Validate order
    if (item.order === undefined || item.order === null) {
      errors.push(`Item at index ${index} is missing order`);
    } else if (typeof item.order !== 'number') {
      errors.push(`Item at index ${index}: order must be a number`);
    } else if (!Number.isInteger(item.order)) {
      errors.push(`Item at index ${index}: order must be an integer`);
    } else if (item.order < 1) {
      errors.push(`Item at index ${index}: order must be greater than 0`);
    } else {
      // Check for duplicate order values
      if (orderValues.has(item.order)) {
        errors.push(`Item at index ${index}: duplicate order value ${item.order}`);
      }
      orderValues.add(item.order);
    }
  });
  
  // Check for any validation errors
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Image reorder validation failed',
        code: 'INVALID_REORDER_DATA',
        details: errors
      }
    });
  }
  
  next();
};

module.exports = {
  validateObjectId,
  validateDocumentCreation,
  validateDocumentUpdate,
  validateImageReorder
};
