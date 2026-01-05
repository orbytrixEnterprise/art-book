/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the document
 *           example: "507f1f77bcf86cd799439011"
 *         title:
 *           type: string
 *           maxLength: 200
 *           description: Title of the document
 *           example: "My Drawing Project"
 *         description:
 *           type: string
 *           maxLength: 2000
 *           description: Detailed description of the document
 *           example: "A collection of architectural drawings for the new building"
 *         category:
 *           oneOf:
 *             - type: string
 *               description: Category ID reference
 *               example: "507f1f77bcf86cd799439015"
 *             - $ref: '#/components/schemas/Category'
 *           description: Category this document belongs to (can be ID or populated category object)
 *         status:
 *           type: string
 *           enum: [active, deactive]
 *           default: active
 *           description: Current status of the document
 *           example: "active"
 *         main_image:
 *           type: object
 *           nullable: true
 *           description: Main image for the document
 *           properties:
 *             cloudinaryId:
 *               type: string
 *               nullable: true
 *               description: Cloudinary public ID for the main image
 *               example: "drawing-app/documents/main_abc123"
 *             url:
 *               type: string
 *               format: uri
 *               nullable: true
 *               description: Full URL to access the main image
 *               example: "https://res.cloudinary.com/demo/image/upload/v1234567890/drawing-app/documents/main_abc123.jpg"
 *         images:
 *           type: array
 *           description: Array of images associated with the document
 *           items:
 *             $ref: '#/components/schemas/ImageEntity'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the document was created
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the document was last updated
 *           example: "2024-01-15T14:45:00.000Z"
 *       example:
 *         _id: "507f1f77bcf86cd799439011"
 *         title: "My Drawing Project"
 *         description: "A collection of architectural drawings"
 *         category:
 *           _id: "507f1f77bcf86cd799439015"
 *           name: "Architecture"
 *           slug: "architecture"
 *           icon: "🏛️"
 *         status: "active"
 *         main_image:
 *           cloudinaryId: "drawing-app/documents/main_abc123"
 *           url: "https://res.cloudinary.com/demo/image/upload/v1234567890/drawing-app/documents/main_abc123.jpg"
 *         images: []
 *         createdAt: "2024-01-15T10:30:00.000Z"
 *         updatedAt: "2024-01-15T10:30:00.000Z"
 *
 *     CreateDocumentRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - category
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 200
 *           description: Title of the document
 *           example: "My Drawing Project"
 *         description:
 *           type: string
 *           maxLength: 2000
 *           description: Detailed description of the document
 *           example: "A collection of architectural drawings"
 *         category:
 *           type: string
 *           description: Category ID to assign the document to (must be an active category)
 *           example: "507f1f77bcf86cd799439015"
 *         status:
 *           type: string
 *           enum: [active, deactive]
 *           default: active
 *           description: Initial status of the document
 *           example: "active"
 *
 *     UpdateDocumentRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 200
 *           description: Updated title of the document
 *           example: "Updated Drawing Project"
 *         description:
 *           type: string
 *           maxLength: 2000
 *           description: Updated description of the document
 *           example: "Updated architectural drawings collection"
 *         category:
 *           type: string
 *           description: Updated category ID (must be an active category)
 *           example: "507f1f77bcf86cd799439016"
 *         status:
 *           type: string
 *           enum: [active, deactive]
 *           description: Updated status of the document
 *           example: "deactive"
 */

module.exports = {};
