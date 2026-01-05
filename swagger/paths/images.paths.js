/**
 * @swagger
 * /api/documents/{id}/images:
 *   post:
 *     summary: Upload single image to document
 *     description: Uploads a single image to Cloudinary and associates it with the document. The image is assigned an order value one greater than the highest existing order.
 *     tags: [Images]
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
 *   get:
 *     summary: Get all images for a document
 *     description: Retrieves all images associated with a specific document, ordered by their order value in ascending sequence.
 *     tags: [Images]
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentIdParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ImageListResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   delete:
 *     summary: Remove multiple images from document
 *     description: Removes multiple images from a document and Cloudinary. Remaining images are reordered to maintain sequential order values.
 *     tags: [Images]
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentIdParam'
 *     requestBody:
 *       $ref: '#/components/requestBodies/RemoveMultipleImagesBody'
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
 * /api/documents/{id}/images/bulk:
 *   post:
 *     summary: Upload multiple images to document
 *     description: Uploads multiple images (up to 20) to Cloudinary in parallel. Returns detailed results including successful and failed uploads. Failed uploads do not prevent successful ones from being added.
 *     tags: [Images]
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentIdParam'
 *     requestBody:
 *       $ref: '#/components/requestBodies/BulkImageUpload'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/BulkUploadResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/documents/{id}/images/{imageId}:
 *   delete:
 *     summary: Remove single image from document
 *     description: Removes a specific image from the document and Cloudinary. Remaining images are reordered to maintain sequential order values.
 *     tags: [Images]
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentIdParam'
 *       - $ref: '#/components/parameters/ImageIdParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/DocumentResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/documents/{id}/images/reorder:
 *   put:
 *     summary: Reorder images within document
 *     description: Updates the order values of images within a document. All order values must be unique and all imageIds must exist in the document.
 *     tags: [Images]
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentIdParam'
 *     requestBody:
 *       $ref: '#/components/requestBodies/ReorderImagesBody'
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
 * /api/images/multi-document:
 *   post:
 *     summary: Get images from multiple documents
 *     description: Retrieves images from multiple documents in a single request. Returns images grouped by document identifier. Invalid document IDs are indicated in the response.
 *     tags: [Images]
 *     requestBody:
 *       $ref: '#/components/requestBodies/MultiDocumentImagesBody'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/MultiDocumentImagesResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

module.exports = {};
