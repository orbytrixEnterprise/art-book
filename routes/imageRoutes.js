const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const { validateObjectId, validateImageReorder } = require('../middleware/validation');
const { uploadSingle, uploadBulk } = require('../middleware/upload');

/**
 * @route   POST /api/documents/:id/images
 * @desc    Upload a single image to a document
 * @access  Public
 */
router.post('/documents/:id/images', validateObjectId('id'), uploadSingle, imageController.uploadSingleImage);

/**
 * @route   POST /api/documents/:id/images/bulk
 * @desc    Upload multiple images to a document
 * @access  Public
 */
router.post('/documents/:id/images/bulk', validateObjectId('id'), uploadBulk, imageController.uploadBulkImages);

/**
 * @route   GET /api/documents/:id/images
 * @desc    Get all images for a specific document
 * @access  Public
 */
router.get('/documents/:id/images', validateObjectId('id'), imageController.getDocumentImages);

/**
 * @route   PUT /api/documents/:id/images/reorder
 * @desc    Reorder images within a document
 * @access  Public
 */
router.put('/documents/:id/images/reorder', validateObjectId('id'), validateImageReorder, imageController.reorderImages);

/**
 * @route   DELETE /api/documents/:id/images/:imageId
 * @desc    Remove a single image from a document
 * @access  Public
 */
router.delete('/documents/:id/images/:imageId', validateObjectId('id'), validateObjectId('imageId'), imageController.removeImage);

/**
 * @route   DELETE /api/documents/:id/images
 * @desc    Remove multiple images from a document
 * @access  Public
 */
router.delete('/documents/:id/images', validateObjectId('id'), imageController.removeMultipleImages);

/**
 * @route   POST /api/images/multi-document
 * @desc    Get images from multiple documents
 * @access  Public
 */
router.post('/images/multi-document', imageController.getMultiDocumentImages);

module.exports = router;
