/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardStatistics:
 *       type: object
 *       properties:
 *         documents:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: Total number of documents
 *               example: 45
 *             active:
 *               type: integer
 *               description: Number of active documents
 *               example: 38
 *             inactive:
 *               type: integer
 *               description: Number of inactive documents
 *               example: 7
 *         categories:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: Total number of categories
 *               example: 8
 *             active:
 *               type: integer
 *               description: Number of active categories
 *               example: 6
 *             inactive:
 *               type: integer
 *               description: Number of inactive categories
 *               example: 2
 *             withDocuments:
 *               type: integer
 *               description: Number of categories that have documents
 *               example: 5
 *         images:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: Total number of images across all documents
 *               example: 127
 *         mostPopularCategories:
 *           type: array
 *           description: Most popular categories by document count
 *           items:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *                 description: Category ID
 *                 example: "507f1f77bcf86cd799439011"
 *               categoryName:
 *                 type: string
 *                 description: Category name
 *                 example: "People"
 *               categorySlug:
 *                 type: string
 *                 description: Category slug
 *                 example: "people"
 *               categoryIcon:
 *                 type: string
 *                 description: Category icon
 *                 example: "👤"
 *               documentCount:
 *                 type: integer
 *                 description: Number of documents in this category
 *                 example: 23
 *               imageCount:
 *                 type: integer
 *                 description: Number of images in this category
 *                 example: 67
 *         recentDocuments:
 *           type: array
 *           description: Recently created documents
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: Document ID
 *                 example: "507f1f77bcf86cd799439020"
 *               title:
 *                 type: string
 *                 description: Document title
 *                 example: "Portrait Study"
 *               description:
 *                 type: string
 *                 description: Document description (truncated)
 *                 example: "A detailed portrait drawing..."
 *               category:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "507f1f77bcf86cd799439011"
 *                   name:
 *                     type: string
 *                     example: "People"
 *                   slug:
 *                     type: string
 *                     example: "people"
 *                   icon:
 *                     type: string
 *                     example: "👤"
 *               main_image:
 *                 type: object
 *                 properties:
 *                   cloudinaryId:
 *                     type: string
 *                     nullable: true
 *                   url:
 *                     type: string
 *                     nullable: true
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-15T14:30:00.000Z"
 *         summary:
 *           type: object
 *           properties:
 *             totalItems:
 *               type: integer
 *               description: Total number of documents and categories combined
 *               example: 53
 *             lastUpdated:
 *               type: string
 *               format: date-time
 *               description: When the statistics were last calculated
 *               example: "2024-01-15T16:45:30.123Z"
 *       example:
 *         documents:
 *           total: 45
 *           active: 38
 *           inactive: 7
 *         categories:
 *           total: 8
 *           active: 6
 *           inactive: 2
 *           withDocuments: 5
 *         images:
 *           total: 127
 *         mostPopularCategories:
 *           - categoryId: "507f1f77bcf86cd799439011"
 *             categoryName: "People"
 *             categorySlug: "people"
 *             categoryIcon: "👤"
 *             documentCount: 23
 *             imageCount: 67
 *           - categoryId: "507f1f77bcf86cd799439012"
 *             categoryName: "Nature"
 *             categorySlug: "nature"
 *             categoryIcon: "🌿"
 *             documentCount: 18
 *             imageCount: 45
 *         recentDocuments:
 *           - _id: "507f1f77bcf86cd799439020"
 *             title: "Portrait Study"
 *             description: "A detailed portrait drawing..."
 *             category:
 *               _id: "507f1f77bcf86cd799439011"
 *               name: "People"
 *               slug: "people"
 *               icon: "👤"
 *             main_image:
 *               cloudinaryId: "sample_id"
 *               url: "https://res.cloudinary.com/..."
 *             createdAt: "2024-01-15T14:30:00.000Z"
 *         summary:
 *           totalItems: 53
 *           lastUpdated: "2024-01-15T16:45:30.123Z"
 */

module.exports = {};