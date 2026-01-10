const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { validateObjectId, validateDocumentCreation, validateDocumentUpdate } = require('../middleware/validation');
const { uploadSingle } = require('../middleware/upload');

/**
 * @route   POST /api/documents
 * @desc    Create a new document
 * @access  Public
 */
router.post('/', validateDocumentCreation, documentController.createDocument);

/**
 * @route   GET /api/documents
 * @desc    Get all documents with optional status, category, and search filtering
 * @access  Public
 */
router.get('/', documentController.getAllDocuments);

/**
 * @route   GET /api/documents/:id
 * @desc    Get a document by ID
 * @access  Public
 */
router.get('/:id', validateObjectId('id'), documentController.getDocumentById);

/**
 * @route   PUT /api/documents/:id
 * @desc    Update a document by ID
 * @access  Public
 */
router.put('/:id', validateObjectId('id'), validateDocumentUpdate, documentController.updateDocument);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete a document by ID
 * @access  Public
 */
router.delete('/:id', validateObjectId('id'), documentController.deleteDocument);

/**
 * @route   POST /api/documents/:id/main-image
 * @desc    Add or update main image for a document
 * @access  Public
 */
router.post('/:id/main-image', validateObjectId('id'), uploadSingle, documentController.addMainImage);

/**
 * @route   PUT /api/documents/:id/main-image
 * @desc    Update main image for a document
 * @access  Public
 */
router.put('/:id/main-image', validateObjectId('id'), uploadSingle, documentController.updateMainImage);

/**
 * @route   DELETE /api/documents/:id/main-image
 * @desc    Remove main image from a document
 * @access  Public
 */
router.delete('/:id/main-image', validateObjectId('id'), documentController.removeMainImage);

module.exports = router;
