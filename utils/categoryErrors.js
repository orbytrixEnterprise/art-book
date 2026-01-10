/**
 * Category-specific error handling utilities
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5
 */

const mongoose = require('mongoose');

/**
 * Custom error class for category operations
 */
class CategoryError extends Error {
  constructor(message, code, statusCode = 400, details = null) {
    super(message);
    this.name = 'CategoryError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error codes for category operations
 */
const ERROR_CODES = {
  DUPLICATE_NAME: 'DUPLICATE_CATEGORY_NAME',
  NOT_FOUND: 'CATEGORY_NOT_FOUND',
  IN_USE: 'CATEGORY_IN_USE',
  INVALID_REFERENCE: 'INVALID_CATEGORY_REFERENCE',
  CANNOT_DELETE_DEFAULT: 'CANNOT_DELETE_DEFAULT_CATEGORY',
  VALIDATION_ERROR: 'CATEGORY_VALIDATION_ERROR',
  INVALID_ID: 'INVALID_CATEGORY_ID',
  INACTIVE_CATEGORY: 'INACTIVE_CATEGORY_ASSIGNMENT'
};

/**
 * Create a duplicate category name error
 * @param {string} categoryName - The duplicate category name
 * @returns {CategoryError}
 */
const createDuplicateNameError = (categoryName) => {
  return new CategoryError(
    `Category name '${categoryName}' already exists`,
    ERROR_CODES.DUPLICATE_NAME,
    409
  );
};

/**
 * Create a category not found error
 * @param {string} identifier - Category ID or slug
 * @returns {CategoryError}
 */
const createNotFoundError = (identifier = '') => {
  const message = identifier 
    ? `Category with identifier '${identifier}' not found`
    : 'Category not found';
  
  return new CategoryError(
    message,
    ERROR_CODES.NOT_FOUND,
    404
  );
};

/**
 * Create a category in use error (cannot delete)
 * @param {string} categoryName - Name of the category
 * @param {number} documentCount - Number of documents using this category
 * @returns {CategoryError}
 */
const createCategoryInUseError = (categoryName, documentCount) => {
  return new CategoryError(
    `Cannot delete category '${categoryName}' because it has ${documentCount} assigned document${documentCount === 1 ? '' : 's'}`,
    ERROR_CODES.IN_USE,
    409,
    { documentCount, categoryName }
  );
};

/**
 * Create an invalid category reference error
 * @param {string} categoryId - The invalid category ID
 * @returns {CategoryError}
 */
const createInvalidReferenceError = (categoryId) => {
  return new CategoryError(
    `Invalid category reference: ${categoryId}`,
    ERROR_CODES.INVALID_REFERENCE,
    400,
    { categoryId }
  );
};

/**
 * Create a cannot delete default category error
 * @returns {CategoryError}
 */
const createCannotDeleteDefaultError = () => {
  return new CategoryError(
    'Cannot delete the default category. The system requires at least one default category.',
    ERROR_CODES.CANNOT_DELETE_DEFAULT,
    403
  );
};

/**
 * Create an invalid category ID format error
 * @param {string} categoryId - The invalid ID
 * @returns {CategoryError}
 */
const createInvalidIdError = (categoryId) => {
  return new CategoryError(
    `Invalid category ID format: ${categoryId}`,
    ERROR_CODES.INVALID_ID,
    400,
    { categoryId }
  );
};

/**
 * Create an inactive category assignment error
 * @param {string} categoryName - Name of the inactive category
 * @returns {CategoryError}
 */
const createInactiveCategoryError = (categoryName) => {
  return new CategoryError(
    `Cannot assign document to inactive category '${categoryName}'`,
    ERROR_CODES.INACTIVE_CATEGORY,
    400,
    { categoryName }
  );
};

/**
 * Create a validation error for category data
 * @param {string|Array} messages - Validation error message(s)
 * @returns {CategoryError}
 */
const createValidationError = (messages) => {
  const messageArray = Array.isArray(messages) ? messages : [messages];
  const message = `Category validation failed: ${messageArray.join(', ')}`;
  
  return new CategoryError(
    message,
    ERROR_CODES.VALIDATION_ERROR,
    400,
    { validationErrors: messageArray }
  );
};

/**
 * Validate category ID format
 * @param {string} categoryId - Category ID to validate
 * @throws {CategoryError} If ID format is invalid
 */
const validateCategoryId = (categoryId) => {
  if (!categoryId) {
    throw createValidationError('Category ID is required');
  }
  
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw createInvalidIdError(categoryId);
  }
};

/**
 * Handle Mongoose errors and convert to CategoryError
 * @param {Error} error - Mongoose error
 * @param {string} operation - The operation being performed
 * @returns {CategoryError}
 */
const handleMongooseError = (error, operation = 'category operation') => {
  // Handle duplicate key error (unique constraint violation)
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    
    if (field === 'name') {
      return createDuplicateNameError(value);
    }
    
    return new CategoryError(
      `Duplicate value for ${field}: ${value}`,
      ERROR_CODES.VALIDATION_ERROR,
      409,
      { field, value }
    );
  }
  
  // Handle validation errors
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return createValidationError(messages);
  }
  
  // Handle cast errors (invalid ObjectId)
  if (error.name === 'CastError') {
    return createInvalidIdError(error.value);
  }
  
  // If it's already a CategoryError, return as-is
  if (error instanceof CategoryError) {
    return error;
  }
  
  // For unknown errors, create a generic category error
  return new CategoryError(
    `Failed to perform ${operation}: ${error.message}`,
    'CATEGORY_OPERATION_FAILED',
    500
  );
};

/**
 * Log category operation errors
 * @param {Error} error - The error to log
 * @param {string} operation - The operation that failed
 * @param {Object} context - Additional context for logging
 */
const logCategoryError = (error, operation, context = {}) => {
  const logData = {
    timestamp: new Date().toISOString(),
    operation,
    error: {
      name: error.name,
      message: error.message,
      code: error.code || 'UNKNOWN',
      statusCode: error.statusCode || 500,
      stack: error.stack
    },
    context
  };
  
  // Log based on error severity
  if (error.statusCode >= 500) {
    console.error('Category Service Error:', JSON.stringify(logData, null, 2));
  } else if (error.statusCode >= 400) {
    console.warn('Category Service Warning:', JSON.stringify(logData, null, 2));
  } else {
    console.info('Category Service Info:', JSON.stringify(logData, null, 2));
  }
};

/**
 * Format error response for API
 * @param {CategoryError} error - The category error
 * @returns {Object} Formatted error response
 */
const formatErrorResponse = (error) => {
  const response = {
    success: false,
    error: {
      message: error.message,
      code: error.code
    }
  };
  
  // Add details if available
  if (error.details) {
    response.error.details = error.details;
  }
  
  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = error.stack;
  }
  
  return response;
};

module.exports = {
  CategoryError,
  ERROR_CODES,
  createDuplicateNameError,
  createNotFoundError,
  createCategoryInUseError,
  createInvalidReferenceError,
  createCannotDeleteDefaultError,
  createInvalidIdError,
  createInactiveCategoryError,
  createValidationError,
  validateCategoryId,
  handleMongooseError,
  logCategoryError,
  formatErrorResponse
};