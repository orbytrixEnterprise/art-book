# Implementation Plan - Category System

- [x] 1. Create Category model and schema


  - Create Category model file (models/Category.js)
  - Define category schema with name, slug, description, icon, status, displayOrder, isDefault fields
  - Add validation rules (name unique, max lengths)
  - Create indexes for slug, status, and displayOrder
  - Implement generateSlug() method
  - Add pre-save hook to auto-generate slug
  - Add virtual field for documentCount
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_



- [x] 2. Update Document model to include category reference



  - Add category field to Document schema (ObjectId reference to Category)
  - Make category field required
  - Add index on category field
  - Add compound index on category and status


  - Add compound index on category and createdAt
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Create Category service layer





  - Create CategoryService class (services/CategoryService.js)
  - Implement createCategory method with name uniqueness validation
  - Implement getAllCategories method with filtering and sorting
  - Implement getCategoryById method
  - Implement getCategoryBySlug method
  - Implement updateCategory method with slug regeneration
  - Implement deleteCategory method with document count check
  - Implement getDocumentsByCategory method with pagination
  - Implement reorderCategories method
  - Implement getCategoryStatistics method
  - Implement initializeDefaultCategory method
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 4.1, 4.2, 4.3, 4.4, 4.5, 7.1, 7.2, 7.3, 7.4, 7.5, 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 4. Create Category controller








  - Create CategoryController class (controllers/categoryController.js)
  - Implement createCategory handler with validation
  - Implement getAllCategories handler with query params
  - Implement getCategoryById handler
  - Implement getCategoryBySlug handler
  - Implement updateCategory handler
  - Implement deleteCategory handler with error handling
  - Implement getDocumentsByCategory handler with pagination
  - Implement reorderCategories handler
  - Implement getCategoryStatistics handler
  - Add error handling for all methods (400, 404, 500)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 5. Create Category routes




  - Create category routes file (routes/categoryRoutes.js)
  - Add POST /api/categories route
  - Add GET /api/categories route
  - Add GET /api/categories/:id route
  - Add GET /api/categories/slug/:slug route
  - Add PUT /api/categories/:id route
  - Add DELETE /api/categories/:id route
  - Add GET /api/categories/:id/documents route
  - Add PUT /api/categories/reorder route
  - Add GET /api/categories/statistics route
  - Add validation middleware for category operations
  - Integrate category routes into main Express app
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 6. Create Category validation middleware
  - Create validation middleware file (middleware/categoryValidation.js)
  - Add validateCategoryCreation middleware
  - Add validateCategoryUpdate middleware
  - Add validateCategoryReorder middleware
  - Validate name length and uniqueness
  - Validate description length
  - Validate status enum values
  - Validate icon length
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 7. Update Document service to handle categories
  - Update createDocument method to validate category exists and is active
  - Update updateDocument method to validate category if changed
  - Update getAllDocuments method to support category filter
  - Update getDocumentById method to populate category information
  - Add category validation helper method
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 8. Update Document controller to handle categories
  - Update createDocument handler to require category field
  - Update updateDocument handler to validate category changes
  - Update getAllDocuments handler to support category query param
  - Update response formatting to include category information
  - Add error handling for invalid category references
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 9. Update Document validation middleware
  - Update validateDocumentCreation to require category field
  - Update validateDocumentUpdate to validate category if provided
  - Add category ObjectId format validation
  - _Requirements: 3.1, 3.2, 8.3, 8.4_

- [x] 10. Create migration script for existing documents
  - Create migration script file (migrations/add-category-system.js)
  - Create default "Uncategorized" category
  - Update all existing documents to reference default category
  - Create indexes on category field
  - Log migration results
  - Make migration idempotent
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 11. Update Swagger documentation for categories
  - Create category schema definition (swagger/schemas/category.schema.js)
  - Define Category model with all fields
  - Define CreateCategoryRequest schema
  - Define UpdateCategoryRequest schema
  - Define CategoryStatistics schema
  - Define ReorderCategoriesRequest schema
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 12. Create Swagger paths for category endpoints
  - Create category paths file (swagger/paths/categories.paths.js)
  - Document POST /api/categories endpoint
  - Document GET /api/categories endpoint
  - Document GET /api/categories/:id endpoint
  - Document GET /api/categories/slug/:slug endpoint
  - Document PUT /api/categories/:id endpoint
  - Document DELETE /api/categories/:id endpoint
  - Document GET /api/categories/:id/documents endpoint
  - Document PUT /api/categories/reorder endpoint
  - Document GET /api/categories/statistics endpoint
  - Add request/response examples for all endpoints
  - _Requirements: 14.1, 14.2, 14.3, 14.5_

- [x] 13. Update Swagger documentation for documents
  - Update Document schema to include category field
  - Update CreateDocumentRequest to require category
  - Update UpdateDocumentRequest to include optional category
  - Update document response examples to show category info
  - Update GET /api/documents to document category filter param
  - _Requirements: 14.4, 14.5_

- [x] 14. Update Swagger components for categories
  - Add category-related request bodies to requestBodies.js
  - Add category-related responses to responses.js
  - Add category-related parameters to parameters.js
  - Add CategoryIdParam parameter
  - Add CategorySlugParam parameter
  - Add CategoryStatusQueryParam parameter
  - _Requirements: 14.1, 14.2, 14.3_

- [-] 15. Initialize default category on server startup
  - Update server startup code (index.js or separate initializer)
  - Call categoryService.initializeDefaultCategory()
  - Log initialization result
  - Handle initialization errors gracefully
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 16. Add category filtering to document list endpoint
  - Update document list query to accept category parameter
  - Filter documents by category ID or slug
  - Maintain compatibility with existing filters (status, search)
  - Update response to include category information
  - _Requirements: 4.4, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 17. Implement category search functionality
  - Add search capability to getAllCategories method
  - Search by category name (case-insensitive)
  - Search by category description
  - Combine search with status filter
  - Return empty array with message if no results
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 18. Add category statistics to dashboard
  - Update dashboard statistics query to include category count
  - Add active category count
  - Add most popular categories by document count
  - Include category statistics in dashboard response
  - _Requirements: 7.1, 7.2, 7.5_

- [ ] 19. Implement category ordering functionality
  - Add drag-and-drop order support in reorderCategories
  - Validate order array contains valid category IDs
  - Update displayOrder for all categories in array
  - Return updated categories sorted by new order
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 20. Add error handling for category operations
  - Handle duplicate category name errors
  - Handle category not found errors
  - Handle category in use (cannot delete) errors
  - Handle invalid category reference errors
  - Return structured error responses with codes
  - Log errors for debugging
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ]* 21. Write unit tests for Category model
  - Test category creation with valid data
  - Test slug generation from name
  - Test slug uniqueness handling
  - Test validation rules (name length, uniqueness)
  - Test pre-save hooks
  - Test virtual fields (documentCount)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ]* 22. Write unit tests for CategoryService
  - Test createCategory with valid and invalid data
  - Test getAllCategories with various filters
  - Test getCategoryById with valid and invalid IDs
  - Test updateCategory with name changes
  - Test deleteCategory with and without documents
  - Test getDocumentsByCategory with pagination
  - Test reorderCategories
  - Test getCategoryStatistics
  - Test initializeDefaultCategory
  - _Requirements: All service-related requirements_

- [ ]* 23. Write integration tests for category API
  - Test POST /api/categories endpoint
  - Test GET /api/categories with filters
  - Test GET /api/categories/:id endpoint
  - Test PUT /api/categories/:id endpoint
  - Test DELETE /api/categories/:id endpoint
  - Test GET /api/categories/:id/documents endpoint
  - Test category validation errors
  - Test category not found errors
  - Test category in use errors
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ]* 24. Write integration tests for updated document API
  - Test document creation with category
  - Test document creation without category (should fail)
  - Test document creation with invalid category
  - Test document creation with inactive category
  - Test document update with category change
  - Test document filtering by category
  - Test document retrieval includes category info
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 25. Test migration script
  - Test migration creates default category
  - Test migration updates existing documents
  - Test migration is idempotent
  - Test migration handles errors gracefully
  - Verify document count after migration
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 26. Create category management documentation
  - Create user guide for category system (docs/CATEGORY_SYSTEM.md)
  - Document category CRUD operations
  - Document category-document relationship
  - Document migration process
  - Add API usage examples
  - Document error codes and messages
  - _Requirements: All requirements (documentation)_

- [ ] 27. Update existing API documentation
  - Update README.md to mention category system
  - Update API examples to include category
  - Update environment setup instructions
  - Add migration instructions
  - _Requirements: All requirements (documentation)_
