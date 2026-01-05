/**
 * @swagger
 * components:
 *   responses:
 *     SuccessResponse:
 *       description: Successful operation
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               data:
 *                 type: object
 *
 *     DocumentResponse:
 *       description: Document retrieved successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               data:
 *                 $ref: '#/components/schemas/Document'
 *
 *     DocumentListResponse:
 *       description: List of documents retrieved successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               data:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Document'
 *
 *     ImageListResponse:
 *       description: List of images retrieved successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               data:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ImageEntity'
 *
 *     BulkUploadResponse:
 *       description: Bulk upload completed with results
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               data:
 *                 $ref: '#/components/schemas/BulkUploadResult'
 *
 *     MultiDocumentImagesResponse:
 *       description: Images from multiple documents retrieved successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               data:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/MultiDocumentImagesResponse'
 *
 *     DeleteResponse:
 *       description: Resource deleted successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               message:
 *                 type: string
 *                 example: "Document deleted successfully"
 *
 *     BadRequestError:
 *       description: Bad request - Invalid input data
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Validation failed"
 *                   code:
 *                     type: string
 *                     example: "VALIDATION_ERROR"
 *                   details:
 *                     type: object
 *
 *     NotFoundError:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Document not found"
 *                   code:
 *                     type: string
 *                     example: "NOT_FOUND"
 *
 *     ServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Internal server error"
 *                   code:
 *                     type: string
 *                     example: "SERVER_ERROR"
 *
 *     CategoryResponse:
 *       description: Category retrieved successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               data:
 *                 $ref: '#/components/schemas/Category'
 *
 *     CategoryListResponse:
 *       description: List of categories retrieved successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               data:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Category'
 *
 *     CategoryStatisticsResponse:
 *       description: Category statistics retrieved successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               data:
 *                 $ref: '#/components/schemas/CategoryStatistics'
 *
 *     CategoryDocumentsResponse:
 *       description: Documents in category retrieved successfully with pagination
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               data:
 *                 type: object
 *                 properties:
 *                   category:
 *                     $ref: '#/components/schemas/Category'
 *                   documents:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Document'
 *                   pagination:
 *                     type: object
 *                     properties:
 *                       currentPage:
 *                         type: integer
 *                         example: 1
 *                       totalPages:
 *                         type: integer
 *                         example: 3
 *                       totalDocuments:
 *                         type: integer
 *                         example: 45
 *                       hasNextPage:
 *                         type: boolean
 *                         example: true
 *                       hasPrevPage:
 *                         type: boolean
 *                         example: false
 *
 *     CategoryInUseError:
 *       description: Category cannot be deleted because it has assigned documents
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Cannot delete category 'People' because it has 15 assigned documents"
 *                   code:
 *                     type: string
 *                     example: "CATEGORY_IN_USE"
 *                   details:
 *                     type: object
 *                     properties:
 *                       documentCount:
 *                         type: integer
 *                         example: 15
 *
 *     DuplicateCategoryError:
 *       description: Category name already exists
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Category name 'People' already exists"
 *                   code:
 *                     type: string
 *                     example: "DUPLICATE_CATEGORY_NAME"
 */

module.exports = {};
