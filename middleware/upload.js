const multer = require('multer');

// Configure memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

// File filter for image types only
const fileFilter = (req, file, cb) => {
  // Allowed image MIME types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    // Accept file
    cb(null, true);
  } else {
    // Reject file
    cb(new Error(`Invalid file type. Only JPEG, JPG, PNG, GIF, and WEBP images are allowed. Received: ${file.mimetype}`), false);
  }
};

// Configure file size limit (10MB)
const limits = {
  fileSize: 10 * 1024 * 1024 // 10MB in bytes
};

// Base multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits
});

// Single upload middleware configuration
const uploadSingle = upload.single('image');

// Bulk upload middleware configuration (max 20 files)
const uploadBulk = upload.array('images', 20);

// Error handling wrapper for single upload
const handleSingleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'File size exceeds the 10MB limit',
            code: 'FILE_TOO_LARGE'
          }
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Unexpected field name. Use "image" as the field name',
            code: 'UNEXPECTED_FIELD'
          }
        });
      }
      // Other Multer errors
      return res.status(400).json({
        success: false,
        error: {
          message: err.message,
          code: 'UPLOAD_ERROR'
        }
      });
    } else if (err) {
      // Custom errors (e.g., from fileFilter)
      return res.status(400).json({
        success: false,
        error: {
          message: err.message,
          code: 'INVALID_FILE'
        }
      });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No file uploaded. Please provide an image file',
          code: 'NO_FILE'
        }
      });
    }
    
    next();
  });
};

// Error handling wrapper for bulk upload
const handleBulkUpload = (req, res, next) => {
  uploadBulk(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'One or more files exceed the 10MB limit',
            code: 'FILE_TOO_LARGE'
          }
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Too many files. Maximum 20 files allowed per upload',
            code: 'TOO_MANY_FILES'
          }
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Unexpected field name. Use "images" as the field name',
            code: 'UNEXPECTED_FIELD'
          }
        });
      }
      // Other Multer errors
      return res.status(400).json({
        success: false,
        error: {
          message: err.message,
          code: 'UPLOAD_ERROR'
        }
      });
    } else if (err) {
      // Custom errors (e.g., from fileFilter)
      return res.status(400).json({
        success: false,
        error: {
          message: err.message,
          code: 'INVALID_FILE'
        }
      });
    }
    
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No files uploaded. Please provide at least one image file',
          code: 'NO_FILES'
        }
      });
    }
    
    next();
  });
};

module.exports = {
  uploadSingle: handleSingleUpload,
  uploadBulk: handleBulkUpload
};
