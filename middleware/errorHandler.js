/**
 * Centralized Error Handler Middleware
 * Handles all errors and formats them into consistent response structure
 */

const { CategoryError, formatErrorResponse } = require('../utils/categoryErrors');

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Mongoose validation errors
 */
const handleMongooseValidationError = (err) => {
  const errors = Object.values(err.errors).map(error => error.message);
  
  return {
    statusCode: 400,
    message: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: errors
  };
};

/**
 * Handle Mongoose CastError (invalid ObjectId)
 */
const handleMongooseCastError = (err) => {
  return {
    statusCode: 400,
    message: `Invalid ${err.path}: ${err.value}`,
    code: 'INVALID_ID'
  };
};

/**
 * Handle Mongoose duplicate key error
 */
const handleMongooseDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  
  return {
    statusCode: 409,
    message: `Duplicate value for field "${field}": ${value}`,
    code: 'DUPLICATE_KEY'
  };
};

/**
 * Handle Cloudinary errors
 */
const handleCloudinaryError = (err) => {
  // Check for common Cloudinary error patterns
  if (err.message && err.message.includes('cloudinary')) {
    return {
      statusCode: 500,
      message: 'Image upload service error',
      code: 'CLOUDINARY_ERROR',
      details: err.message
    };
  }
  
  // Check for Cloudinary API errors
  if (err.http_code) {
    return {
      statusCode: err.http_code >= 500 ? 500 : 400,
      message: err.message || 'Cloudinary operation failed',
      code: 'CLOUDINARY_API_ERROR'
    };
  }
  
  return null;
};

/**
 * Detect error type and format accordingly
 */
const detectErrorType = (err) => {
  // Handle CategoryError instances first
  if (err instanceof CategoryError) {
    return {
      statusCode: err.statusCode,
      message: err.message,
      code: err.code,
      details: err.details
    };
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return handleMongooseValidationError(err);
  }
  
  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return handleMongooseCastError(err);
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    return handleMongooseDuplicateKeyError(err);
  }
  
  // Cloudinary errors
  const cloudinaryError = handleCloudinaryError(err);
  if (cloudinaryError) {
    return cloudinaryError;
  }
  
  // Custom AppError
  if (err.isOperational) {
    return {
      statusCode: err.statusCode,
      message: err.message,
      code: err.code
    };
  }
  
  // Default error
  return null;
};

/**
 * Centralized error handler middleware
 * Must be used as the last middleware in the Express app
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging (enhanced logging for CategoryError)
  if (err instanceof CategoryError) {
    console.error('Category Error occurred:', {
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      details: err.details,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } else {
    console.error('Error occurred:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle CategoryError instances with structured response
  if (err instanceof CategoryError) {
    return res.status(err.statusCode).json(formatErrorResponse(err));
  }
  
  // Detect and format other error types
  const errorInfo = detectErrorType(err);
  
  if (errorInfo) {
    // Known error type
    const response = {
      success: false,
      error: {
        message: errorInfo.message,
        code: errorInfo.code
      }
    };
    
    // Add details if available
    if (errorInfo.details) {
      response.error.details = errorInfo.details;
    }
    
    // Add stack trace in development mode
    if (process.env.NODE_ENV === 'development') {
      response.error.stack = err.stack;
    }
    
    return res.status(errorInfo.statusCode).json(response);
  }
  
  // Unknown error - return generic 500 error
  const response = {
    success: false,
    error: {
      message: process.env.NODE_ENV === 'development' 
        ? err.message 
        : 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  };
  
  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
  }
  
  res.status(500).json(response);
};

/**
 * Handle 404 - Not Found errors
 * Should be used before the error handler middleware
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route not found: ${req.method} ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  AppError,
  CategoryError
};
