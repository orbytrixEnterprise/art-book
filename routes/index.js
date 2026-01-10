const express = require('express');
const router = express.Router();
const documentRoutes = require('./documentRoutes');
const imageRoutes = require('./imageRoutes');
const categoryRoutes = require('./categoryRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// Mount dashboard routes
router.use('/dashboard', dashboardRoutes);

// Mount category routes
router.use('/categories', categoryRoutes);

// Mount document routes
router.use('/documents', documentRoutes);

// Mount image routes (includes both document-specific and multi-document routes)
router.use('/', imageRoutes);

module.exports = router;
