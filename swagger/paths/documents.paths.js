/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Create a new document
 *     description: Creates a new document with title, description, category, and optional status. The document must be assigned to an active category. The document is initialized with an empty images array and automatic timestamps.
 *     tags: [Documents]
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateDocumentBody'
 *     responses:
 *       201:
 *         description: Document created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   get:
 *     summary: Get all documents
 *     description: Retrieves all documents with optional filtering by status and category. Returns documents with their metadata, associated images, and populated category information.
 *     tags: [Documents]
 *     parameters:
 *       - $ref: '#/components/parameters/StatusQueryParam'
 *       - $ref: '#/components/parameters/CategoryQueryParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/DocumentListResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/documents/{id}:
 *   get:
 *     summary: Get document by ID
 *     description: Retrieves a specific document by its unique identifier, including all associated images in order and populated category information.
 *     tags: [Documents]
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentIdParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/DocumentResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   put:
 *     summary: Update document
 *     description: Updates document properties (title, description, category, status). If updating the category, it must be an active category. The updated_at timestamp is automatically updated.
 *     tags: [Documents]
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentIdParam'
 *     requestBody:
 *       $ref: '#/components/requestBodies/UpdateDocumentBody'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/DocumentResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   delete:
 *     summary: Delete document
 *     description: Deletes a document and all associated images from Cloudinary. This operation is irreversible.
 *     tags: [Documents]
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentIdParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/DeleteResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/documents/{id}/main-image:
 *   post:
 *     summary: Add or update main image for document
 *     description: Uploads a main image to Cloudinary and associates it with the document. If a main image already exists, it will be replaced.
 *     tags: [Documents]
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentIdParam'
 *     requestBody:
 *       $ref: '#/components/requestBodies/SingleImageUpload'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/DocumentResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   put:
 *     summary: Update main image for document
 *     description: Replaces the existing main image with a new one. The old image is deleted from Cloudinary.
 *     tags: [Documents]
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentIdParam'
 *     requestBody:
 *       $ref: '#/components/requestBodies/SingleImageUpload'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/DocumentResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   delete:
 *     summary: Remove main image from document
 *     description: Removes the main image from the document and deletes it from Cloudinary.
 *     tags: [Documents]
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentIdParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/DocumentResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

module.exports = {};
