/**
 * @swagger
 * components:
 *   schemas:
 *     ImageEntity:
 *       type: object
 *       required:
 *         - cloudinaryId
 *         - url
 *         - order
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the image entity
 *           example: "507f1f77bcf86cd799439012"
 *         cloudinaryId:
 *           type: string
 *           description: Cloudinary public ID for the image
 *           example: "drawing-app/documents/abc123def456"
 *         url:
 *           type: string
 *           format: uri
 *           description: Full URL to access the image on Cloudinary
 *           example: "https://res.cloudinary.com/demo/image/upload/v1234567890/drawing-app/documents/abc123def456.jpg"
 *         order:
 *           type: integer
 *           minimum: 1
 *           description: Order position of the image within the document
 *           example: 1
 *       example:
 *         _id: "507f1f77bcf86cd799439012"
 *         cloudinaryId: "drawing-app/documents/abc123def456"
 *         url: "https://res.cloudinary.com/demo/image/upload/v1234567890/drawing-app/documents/abc123def456.jpg"
 *         order: 1
 *
 *     ImageOrderUpdate:
 *       type: object
 *       required:
 *         - imageId
 *         - order
 *       properties:
 *         imageId:
 *           type: string
 *           description: ID of the image to reorder
 *           example: "507f1f77bcf86cd799439012"
 *         order:
 *           type: integer
 *           minimum: 1
 *           description: New order position for the image
 *           example: 3
 *
 *     ReorderImagesRequest:
 *       type: object
 *       required:
 *         - imageOrders
 *       properties:
 *         imageOrders:
 *           type: array
 *           description: Array of image order updates
 *           items:
 *             $ref: '#/components/schemas/ImageOrderUpdate'
 *           example:
 *             - imageId: "507f1f77bcf86cd799439012"
 *               order: 2
 *             - imageId: "507f1f77bcf86cd799439013"
 *               order: 1
 *
 *     RemoveMultipleImagesRequest:
 *       type: object
 *       required:
 *         - imageIds
 *       properties:
 *         imageIds:
 *           type: array
 *           description: Array of image IDs to remove
 *           items:
 *             type: string
 *           example: ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
 *
 *     MultiDocumentImagesRequest:
 *       type: object
 *       required:
 *         - documentIds
 *       properties:
 *         documentIds:
 *           type: array
 *           description: Array of document IDs to retrieve images from
 *           items:
 *             type: string
 *           example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439014"]
 *
 *     BulkUploadResult:
 *       type: object
 *       properties:
 *         document:
 *           $ref: '#/components/schemas/Document'
 *         uploadResults:
 *           type: object
 *           properties:
 *             successful:
 *               type: integer
 *               description: Number of successfully uploaded images
 *               example: 5
 *             failed:
 *               type: integer
 *               description: Number of failed image uploads
 *               example: 2
 *             failures:
 *               type: array
 *               description: Details of failed uploads
 *               items:
 *                 type: object
 *                 properties:
 *                   filename:
 *                     type: string
 *                     example: "image1.jpg"
 *                   error:
 *                     type: string
 *                     example: "Upload timeout"
 *
 *     MultiDocumentImagesResponse:
 *       type: object
 *       properties:
 *         documentId:
 *           type: string
 *           description: Document identifier
 *           example: "507f1f77bcf86cd799439011"
 *         images:
 *           type: array
 *           description: Images belonging to this document
 *           items:
 *             $ref: '#/components/schemas/ImageEntity'
 */

module.exports = {};
