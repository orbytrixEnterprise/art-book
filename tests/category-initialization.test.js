require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const categoryService = require('../services/CategoryService');
const connectDB = require('../config/database');

describe('Category Initialization', () => {
  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Connect to test database
    await connectDB();
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  describe('initializeDefaultCategory', () => {
    beforeEach(async () => {
      // Clean up categories before each test
      await Category.deleteMany({});
    });

    it('should create default category when none exists', async () => {
      const result = await categoryService.initializeDefaultCategory();

      expect(result.success).toBe(true);
      expect(result.created).toBe(true);
      expect(result.message).toBe('Default category created successfully');
      expect(result.category.name).toBe('Uncategorized');
      expect(result.category.slug).toBe('uncategorized');
      expect(result.category.icon).toBe('📁');
      expect(result.category.isDefault).toBe(true);
      expect(result.category.status).toBe('active');
      expect(result.category.displayOrder).toBe(999);
    });

    it('should not create duplicate default category', async () => {
      // Create default category first time
      const firstResult = await categoryService.initializeDefaultCategory();
      expect(firstResult.created).toBe(true);

      // Try to create again
      const secondResult = await categoryService.initializeDefaultCategory();
      expect(secondResult.success).toBe(true);
      expect(secondResult.created).toBe(false);
      expect(secondResult.message).toBe('Default category already exists');
      expect(secondResult.category.name).toBe('Uncategorized');

      // Verify only one default category exists
      const defaultCategories = await Category.find({ isDefault: true });
      expect(defaultCategories).toHaveLength(1);
    });

    it('should return existing default category if already present', async () => {
      // Manually create a default category
      const existingDefault = await Category.create({
        name: 'Uncategorized',
        slug: 'uncategorized',
        description: 'Documents without a specific category',
        icon: '📁',
        status: 'active',
        displayOrder: 999,
        isDefault: true
      });

      const result = await categoryService.initializeDefaultCategory();

      expect(result.success).toBe(true);
      expect(result.created).toBe(false);
      expect(result.category._id.toString()).toBe(existingDefault._id.toString());
    });
  });
});
