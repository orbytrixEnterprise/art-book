/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the category
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           maxLength: 100
 *           description: Name of the category
 *           example: "People"
 *         slug:
 *           type: string
 *           description: URL-friendly version of the category name
 *           example: "people"
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Detailed description of the category
 *           example: "Portraits and people-related drawings"
 *         icon:
 *           type: string
 *           description: Icon or emoji representing the category
 *           example: "👤"
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *           description: Current status of the category
 *           example: "active"
 *         displayOrder:
 *           type: integer
 *           description: Order position for displaying categories
 *           example: 1
 *         isDefault:
 *           type: boolean
 *           description: Whether this is the default category
 *           example: false
 *         documentCount:
 *           type: integer
 *           description: Number of documents assigned to this category
 *           example: 15
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the category was created
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the category was last updated
 *           example: "2024-01-15T14:45:00.000Z"
 *       example:
 *         _id: "507f1f77bcf86cd799439011"
 *         name: "People"
 *         slug: "people"
 *         description: "Portraits and people-related drawings"
 *         icon: "👤"
 *         status: "active"
 *         displayOrder: 1
 *         isDefault: false
 *         documentCount: 15
 *         createdAt: "2024-01-15T10:30:00.000Z"
 *         updatedAt: "2024-01-15T14:45:00.000Z"
 *
 *     CreateCategoryRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *           description: Name of the category
 *           example: "People"
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Detailed description of the category
 *           example: "Portraits and people-related drawings"
 *         icon:
 *           type: string
 *           description: Icon or emoji representing the category
 *           example: "👤"
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *           description: Initial status of the category
 *           example: "active"
 *       example:
 *         name: "People"
 *         description: "Portraits and people-related drawings"
 *         icon: "👤"
 *         status: "active"
 *
 *     UpdateCategoryRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *           description: Updated name of the category
 *           example: "People & Portraits"
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Updated description of the category
 *           example: "All types of people-related drawings and portraits"
 *         icon:
 *           type: string
 *           description: Updated icon or emoji for the category
 *           example: "👥"
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Updated status of the category
 *           example: "inactive"
 *       example:
 *         name: "People & Portraits"
 *         description: "All types of people-related drawings and portraits"
 *         icon: "👥"
 *
 *     CategoryStatistics:
 *       type: object
 *       properties:
 *         totalCategories:
 *           type: integer
 *           description: Total number of categories in the system
 *           example: 8
 *         activeCategories:
 *           type: integer
 *           description: Number of active categories
 *           example: 6
 *         inactiveCategories:
 *           type: integer
 *           description: Number of inactive categories
 *           example: 2
 *         categoriesWithDocuments:
 *           type: integer
 *           description: Number of categories that have at least one document
 *           example: 5
 *         topCategories:
 *           type: array
 *           description: Most popular categories by document count
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: Category ID
 *                 example: "507f1f77bcf86cd799439011"
 *               name:
 *                 type: string
 *                 description: Category name
 *                 example: "People"
 *               documentCount:
 *                 type: integer
 *                 description: Number of documents in this category
 *                 example: 23
 *       example:
 *         totalCategories: 8
 *         activeCategories: 6
 *         inactiveCategories: 2
 *         categoriesWithDocuments: 5
 *         topCategories:
 *           - _id: "507f1f77bcf86cd799439011"
 *             name: "People"
 *             documentCount: 23
 *           - _id: "507f1f77bcf86cd799439012"
 *             name: "Nature"
 *             documentCount: 18
 *
 *     ReorderCategoriesRequest:
 *       type: object
 *       required:
 *         - categoryOrder
 *       properties:
 *         categoryOrder:
 *           type: array
 *           description: Array of category IDs in the desired display order
 *           items:
 *             type: string
 *           example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
 *       example:
 *         categoryOrder: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
 */

module.exports = {};
