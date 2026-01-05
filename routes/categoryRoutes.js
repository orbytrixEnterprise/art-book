const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { validateObjectId } = require('../middleware/validation');
const { validateCategoryCreation, validateCategoryUpdate, validateCategoryReorder } = require('../middleware/categoryValidation');

/**
 * @route   GET /api/categories/statistics
 * @desc    Get category statistics
 * @access  Public
 */
router.get('/statistics', categoryController.getCategoryStatistics);

/**
 * @route   GET /api/categories/slug/:slug
 * @desc    Get a category by slug
 * @access  Public
 */
router.get('/slug/:slug', categoryController.getCategoryBySlug);

/**
 * @route   PUT /api/categories/reorder
 * @desc    Reorder categories
 * @access  Public
 */
router.put('/reorder', validateCategoryReorder, categoryController.reorderCategories);

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Public
 */
router.post('/', validateCategoryCreation, categoryController.createCategory);

/**
 * @route   GET /api/categories
 * @desc    Get all categories with optional filtering
 * @access  Public
 */
router.get('/', categoryController.getAllCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Get a category by ID
 * @access  Public
 */
router.get('/:id', validateObjectId('id'), categoryController.getCategoryById);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update a category by ID
 * @access  Public
 */
router.put('/:id', validateObjectId('id'), validateCategoryUpdate, categoryController.updateCategory);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category by ID
 * @access  Public
 */
router.delete('/:id', validateObjectId('id'), categoryController.deleteCategory);

/**
 * @route   GET /api/categories/:id/documents
 * @desc    Get documents by category with pagination
 * @access  Public
 */
router.get('/:id/documents', validateObjectId('id'), categoryController.getDocumentsByCategory);

module.exports = router;
