# Implementation Plan

- [x] 1. Set up project foundation and dependencies





  - Initialize package.json with required dependencies (express, mongoose, cloudinary, multer, dotenv, cors)
  - Create .env.example file with all required environment variables
  - Set up main server file (index.js) with Express app initialization
  - Configure MongoDB connection with error handling
  - Configure Cloudinary with environment variables
  - _Requirements: 1.1, 1.3, 1.4_

- [x] 2. Create Document model and schema





  - Define Mongoose schema for Document with title, description, status, images array, and timestamps
  - Add schema validation rules (required fields, string lengths, enum values)
  - Add indexes for status and createdAt fields
  - Implement schema methods for image order management
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. Implement Cloudinary service




  - Create CloudinaryService class with upload configuration
  - Implement uploadImage method with folder structure and transformations
  - Implement deleteImage method for single image removal
  - Implement deleteBulkImages method for multiple image removal
  - Add error handling for Cloudinary API failures
  - _Requirements: 5.1, 5.5, 6.1, 7.1_

- [x] 4. Implement Document service layer





  - Create DocumentService with createDocument method
  - Implement getDocumentById method with error handling for non-existent documents
  - Implement getAllDocuments method with optional status filtering
  - Implement updateDocument method with timestamp updates
  - Implement deleteDocument method with cascading image deletion
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4_

- [x] 5. Implement Image service layer





  - Create ImageService with uploadSingleImage method
  - Implement order calculation logic (maxOrder + 1 or 1 if empty)
  - Implement uploadBulkImages method with Promise.allSettled for parallel processing
  - Implement bulk upload result tracking (successful and failed uploads)
  - Implement removeImage method with Cloudinary deletion and order resequencing
  - Implement removeMultipleImages method for batch removal
  - Implement reorderImages method with validation
  - Implement getDocumentImages method
  - Implement getMultiDocumentImages method with document grouping
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 6. Create upload middleware with Multer




  - Configure Multer with memory storage for Cloudinary uploads
  - Set up file filter for image types only (jpeg, jpg, png, gif, webp)
  - Configure file size limit (10MB)
  - Create single upload middleware configuration
  - Create bulk upload middleware configuration (max 20 files)
  - Add error handling for file upload errors
  - _Requirements: 5.1, 6.1_

- [x] 7. Create validation middleware




  - Implement MongoDB ObjectId validation middleware
  - Implement request body validation middleware for document creation
  - Implement request body validation middleware for document updates
  - Implement image reorder validation middleware
  - Add custom error messages for validation failures
  - _Requirements: 1.1, 3.1, 3.3, 3.5, 8.4_

- [x] 8. Implement Document controllers





  - Create createDocument controller with request validation and error handling
  - Create getDocumentById controller with 404 handling
  - Create getAllDocuments controller with query parameter support for status filtering
  - Create updateDocument controller with validation and 404 handling
  - Create deleteDocument controller with success response
  - Format all responses with consistent structure (success, data/error)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4_

- [x] 9. Implement Image controllers





  - Create uploadSingleImage controller with file validation
  - Create uploadBulkImages controller with detailed result response
  - Create removeImage controller with 404 handling
  - Create removeMultipleImages controller with batch processing
  - Create reorderImages controller with validation
  - Create getDocumentImages controller with ordered response
  - Create getMultiDocumentImages controller with grouped response
  - Add error handling for Cloudinary failures
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 10. Create error handling middleware





  - Implement centralized error handler middleware
  - Add error type detection (validation, not found, server errors)
  - Format error responses with consistent structure
  - Add development vs production error details
  - Handle Mongoose validation errors
  - Handle Cloudinary errors
  - _Requirements: 3.5, 4.3, 5.5, 7.4, 10.5_

- [x] 11. Set up API routes





  - Create document routes (POST, GET, PUT, DELETE /api/documents)
  - Create document detail route (GET /api/documents/:id)
  - Create single image upload route (POST /api/documents/:id/images)
  - Create bulk image upload route (POST /api/documents/:id/images/bulk)
  - Create image removal routes (DELETE /api/documents/:id/images/:imageId and DELETE /api/documents/:id/images)
  - Create image reorder route (PUT /api/documents/:id/images/reorder)
  - Create document images route (GET /api/documents/:id/images)
  - Create multi-document images route (POST /api/images/multi-document)
  - Apply appropriate middleware to each route
  - _Requirements: All requirements_

- [x] 12. Configure Express application




  - Set up Express middleware (cors, json, urlencoded)
  - Mount API routes
  - Add error handling middleware as last middleware
  - Configure server to listen on PORT from environment
  - Add graceful shutdown handling
  - _Requirements: All requirements_

- [x] 13. Create integration tests for Document API






  - Write tests for document creation with valid and invalid data
  - Write tests for document retrieval (single and all)
  - Write tests for document updates
  - Write tests for document deletion with cascading image removal
  - Write tests for status filtering
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4_

- [x] 14. Create integration tests for Image API





  - Write tests for single image upload
  - Write tests for bulk image upload with partial failures
  - Write tests for image removal and reordering
  - Write tests for multi-document image retrieval
  - Mock Cloudinary service for tests
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 15. Create professional Swagger API documentation




  - Install swagger-ui-express and swagger-jsdoc dependencies
  - Create swagger folder with modular structure
  - Create swagger configuration file (swagger.config.js)
  - Create separate schema definitions for Document and Image models
  - Create separate path definitions for Document API endpoints
  - Create separate path definitions for Image API endpoints
  - Create reusable component definitions (responses, parameters, request bodies)
  - Integrate Swagger UI into Express application at /api-docs route
  - Add comprehensive API descriptions, examples, and response codes
  - Document all request/response schemas with proper validation rules
  - _Requirements: All requirements (API documentation)_
