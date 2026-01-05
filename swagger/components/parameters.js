/**
 * @swagger
 * components:
 *   parameters:
 *     DocumentIdParam:
 *       name: id
 *       in: path
 *       required: true
 *       description: Unique identifier of the document
 *       schema:
 *         type: string
 *         pattern: '^[0-9a-fA-F]{24}$'
 *       example: "507f1f77bcf86cd799439011"
 *
 *     ImageIdParam:
 *       name: imageId
 *       in: path
 *       required: true
 *       description: Unique identifier of the image
 *       schema:
 *         type: string
 *         pattern: '^[0-9a-fA-F]{24}$'
 *       example: "507f1f77bcf86cd799439012"
 *
 *     StatusQueryParam:
 *       name: status
 *       in: query
 *       required: false
 *       description: Filter documents by status
 *       schema:
 *         type: string
 *         enum: [active, deactive]
 *       example: "active"
 *
 *     CategoryQueryParam:
 *       name: category
 *       in: query
 *       required: false
 *       description: Filter documents by category ID
 *       schema:
 *         type: string
 *         pattern: '^[0-9a-fA-F]{24}$'
 *       example: "507f1f77bcf86cd799439015"
 *
 *     CategoryIdParam:
 *       name: id
 *       in: path
 *       required: true
 *       description: Unique identifier of the category
 *       schema:
 *         type: string
 *         pattern: '^[0-9a-fA-F]{24}$'
 *       example: "507f1f77bcf86cd799439011"
 *
 *     CategorySlugParam:
 *       name: slug
 *       in: path
 *       required: true
 *       description: URL-friendly slug of the category
 *       schema:
 *         type: string
 *         pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$'
 *       example: "people"
 *
 *     CategoryStatusQueryParam:
 *       name: status
 *       in: query
 *       required: false
 *       description: Filter categories by status
 *       schema:
 *         type: string
 *         enum: [active, inactive]
 *       example: "active"
 */

module.exports = {};
