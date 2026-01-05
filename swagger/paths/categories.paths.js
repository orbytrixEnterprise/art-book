/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     description: Creates a new category with a unique name. The slug is automatically generated from the name, and the category is set to active status by default.
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *           examples:
 *             people:
 *               summary: Create People category
 *               value:
 *                 name: "People"
 *                 description: "Portraits and people-related drawings"
 *                 icon: "👤"
 *                 status: "active"
 *             nature:
 *               summary: Create Nature category
 *               value:
 *                 name: "Nature"
 *                 description: "Landscapes and natural scenes"
 *                 icon: "🌿"
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *             examples:
 *               success:
 *                 summary: Successful category creation
 *                 value:
 *                   success: true
 *                   data:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     name: "People"
 *                     slug: "people"
 *                     description: "Portraits and people-related drawings"
 *                     icon: "👤"
 *                     status: "active"
 *                     displayOrder: 1
 *                     isDefault: false
 *                     documentCount: 0
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Bad request - validation error or duplicate name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     code:
 *                       type: string
 *             examples:
 *               duplicateName:
 *                 summary: Duplicate category name
 *                 value:
 *                   success: false
 *                   error:
 *                     message: "Category name 'People' already exists"
 *                     code: "DUPLICATE_CATEGORY_NAME"
 *               validationError:
 *                 summary: Validation error
 *                 value:
 *                   success: false
 *                   error:
 *                     message: "Category name is required"
 *                     code: "VALIDATION_ERROR"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   get:
 *     summary: Get all categories
 *     description: Retrieves all categories with optional filtering by status. Categories are sorted by display order and then alphabetically by name.
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter categories by status
 *         example: "active"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search categories by name or description
 *         example: "people"
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *             examples:
 *               success:
 *                 summary: Successful retrieval
 *                 value:
 *                   success: true
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       name: "People"
 *                       slug: "people"
 *                       description: "Portraits and people-related drawings"
 *                       icon: "👤"
 *                       status: "active"
 *                       displayOrder: 1
 *                       documentCount: 15
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                     - _id: "507f1f77bcf86cd799439012"
 *                       name: "Nature"
 *                       slug: "nature"
 *                       description: "Landscapes and natural scenes"
 *                       icon: "🌿"
 *                       status: "active"
 *                       displayOrder: 2
 *                       documentCount: 23
 *                       createdAt: "2024-01-15T11:00:00.000Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     description: Retrieves a specific category by its unique identifier, including the count of documents assigned to it.
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *             examples:
 *               success:
 *                 summary: Successful retrieval
 *                 value:
 *                   success: true
 *                   data:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     name: "People"
 *                     slug: "people"
 *                     description: "Portraits and people-related drawings"
 *                     icon: "👤"
 *                     status: "active"
 *                     displayOrder: 1
 *                     isDefault: false
 *                     documentCount: 15
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T14:45:00.000Z"
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     code:
 *                       type: string
 *             examples:
 *               notFound:
 *                 summary: Category not found
 *                 value:
 *                   success: false
 *                   error:
 *                     message: "Category not found"
 *                     code: "NOT_FOUND"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   put:
 *     summary: Update category
 *     description: Updates category properties. If the name is changed, the slug is automatically regenerated. Name uniqueness is validated.
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategoryRequest'
 *           examples:
 *             updateName:
 *               summary: Update category name
 *               value:
 *                 name: "People & Portraits"
 *                 description: "All types of people-related drawings and portraits"
 *             updateStatus:
 *               summary: Deactivate category
 *               value:
 *                 status: "inactive"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *             examples:
 *               success:
 *                 summary: Successful update
 *                 value:
 *                   success: true
 *                   data:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     name: "People & Portraits"
 *                     slug: "people-portraits"
 *                     description: "All types of people-related drawings and portraits"
 *                     icon: "👤"
 *                     status: "active"
 *                     displayOrder: 1
 *                     isDefault: false
 *                     documentCount: 15
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T16:20:00.000Z"
 *       400:
 *         description: Bad request - validation error or duplicate name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     code:
 *                       type: string
 *             examples:
 *               duplicateName:
 *                 summary: Duplicate category name
 *                 value:
 *                   success: false
 *                   error:
 *                     message: "Category name 'Nature' already exists"
 *                     code: "DUPLICATE_CATEGORY_NAME"
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   delete:
 *     summary: Delete category
 *     description: Deletes a category if it has no assigned documents. Default categories cannot be deleted.
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Category deleted successfully"
 *             examples:
 *               success:
 *                 summary: Successful deletion
 *                 value:
 *                   success: true
 *                   message: "Category deleted successfully"
 *       400:
 *         description: Bad request - category has documents or is default
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     code:
 *                       type: string
 *                     details:
 *                       type: object
 *             examples:
 *               categoryInUse:
 *                 summary: Category has documents
 *                 value:
 *                   success: false
 *                   error:
 *                     message: "Cannot delete category 'People' because it has 15 assigned documents"
 *                     code: "CATEGORY_IN_USE"
 *                     details:
 *                       documentCount: 15
 *               defaultCategory:
 *                 summary: Cannot delete default category
 *                 value:
 *                   success: false
 *                   error:
 *                     message: "Cannot delete the default category"
 *                     code: "DEFAULT_CATEGORY_PROTECTED"
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/categories/slug/{slug}:
 *   get:
 *     summary: Get category by slug
 *     description: Retrieves a specific category by its URL-friendly slug, including the count of documents assigned to it.
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Category slug
 *         example: "people"
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *             examples:
 *               success:
 *                 summary: Successful retrieval
 *                 value:
 *                   success: true
 *                   data:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     name: "People"
 *                     slug: "people"
 *                     description: "Portraits and people-related drawings"
 *                     icon: "👤"
 *                     status: "active"
 *                     displayOrder: 1
 *                     isDefault: false
 *                     documentCount: 15
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T14:45:00.000Z"
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     code:
 *                       type: string
 *             examples:
 *               notFound:
 *                 summary: Category not found
 *                 value:
 *                   success: false
 *                   error:
 *                     message: "Category not found"
 *                     code: "NOT_FOUND"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/categories/{id}/documents:
 *   get:
 *     summary: Get documents by category
 *     description: Retrieves all documents assigned to a specific category with pagination support. Documents include their full details and associated images.
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of documents per page
 *         example: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, deactive]
 *         description: Filter documents by status
 *         example: "active"
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         slug:
 *                           type: string
 *                         icon:
 *                           type: string
 *                     documents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Document'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalDocuments:
 *                           type: integer
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 *             examples:
 *               success:
 *                 summary: Successful retrieval
 *                 value:
 *                   success: true
 *                   data:
 *                     category:
 *                       _id: "507f1f77bcf86cd799439011"
 *                       name: "People"
 *                       slug: "people"
 *                       icon: "👤"
 *                     documents:
 *                       - _id: "507f1f77bcf86cd799439020"
 *                         title: "Portrait Study"
 *                         description: "A detailed portrait drawing"
 *                         status: "active"
 *                         main_image:
 *                           url: "https://res.cloudinary.com/..."
 *                         images: []
 *                         createdAt: "2024-01-15T14:30:00.000Z"
 *                     pagination:
 *                       currentPage: 1
 *                       totalPages: 1
 *                       totalDocuments: 15
 *                       hasNextPage: false
 *                       hasPrevPage: false
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     code:
 *                       type: string
 *             examples:
 *               notFound:
 *                 summary: Category not found
 *                 value:
 *                   success: false
 *                   error:
 *                     message: "Category not found"
 *                     code: "NOT_FOUND"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/categories/reorder:
 *   put:
 *     summary: Reorder categories
 *     description: Updates the display order of categories. All category IDs in the array must be valid and will be assigned order values based on their position in the array.
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReorderCategoriesRequest'
 *           examples:
 *             reorder:
 *               summary: Reorder three categories
 *               value:
 *                 categoryOrder:
 *                   - "507f1f77bcf86cd799439012"
 *                   - "507f1f77bcf86cd799439011"
 *                   - "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Categories reordered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Categories reordered successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *             examples:
 *               success:
 *                 summary: Successful reorder
 *                 value:
 *                   success: true
 *                   message: "Categories reordered successfully"
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439012"
 *                       name: "Nature"
 *                       slug: "nature"
 *                       displayOrder: 1
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       name: "People"
 *                       slug: "people"
 *                       displayOrder: 2
 *                     - _id: "507f1f77bcf86cd799439013"
 *                       name: "Architecture"
 *                       slug: "architecture"
 *                       displayOrder: 3
 *       400:
 *         description: Bad request - invalid category IDs or missing data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     code:
 *                       type: string
 *             examples:
 *               invalidIds:
 *                 summary: Invalid category IDs
 *                 value:
 *                   success: false
 *                   error:
 *                     message: "One or more category IDs are invalid"
 *                     code: "INVALID_CATEGORY_IDS"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/categories/statistics:
 *   get:
 *     summary: Get category statistics
 *     description: Retrieves comprehensive statistics about categories including total counts, active/inactive breakdown, and most popular categories by document count.
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CategoryStatistics'
 *             examples:
 *               success:
 *                 summary: Successful retrieval
 *                 value:
 *                   success: true
 *                   data:
 *                     totalCategories: 8
 *                     activeCategories: 6
 *                     inactiveCategories: 2
 *                     categoriesWithDocuments: 5
 *                     topCategories:
 *                       - _id: "507f1f77bcf86cd799439011"
 *                         name: "People"
 *                         documentCount: 23
 *                       - _id: "507f1f77bcf86cd799439012"
 *                         name: "Nature"
 *                         documentCount: 18
 *                       - _id: "507f1f77bcf86cd799439013"
 *                         name: "Architecture"
 *                         documentCount: 12
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

module.exports = {};
