require('dotenv').config();
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Category = require('../models/Category');
const connectDB = require('../config/database');
const apiRoutes = require('../routes');

describe('Category Search Functionality', () => {
  let app;

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Connect to test database
    await connectDB();
    
    // Create Express app
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api', apiRoutes);
  });

  beforeEach(async () => {
    // Clear categories before each test
    await Category.deleteMany({});
    
    // Create test categories
    await Category.create([
      {
        name: 'People',
        description: 'Portraits and people-related drawings',
        icon: '👤',
        status: 'active'
      },
      {
        name: 'Nature',
        description: 'Landscapes and natural scenes',
        icon: '🌿',
        status: 'active'
      },
      {
        name: 'Architecture',
        description: 'Buildings and architectural drawings',
        icon: '🏛️',
        status: 'inactive'
      },
      {
        name: 'Abstract',
        description: 'Abstract art and experimental drawings',
        icon: '🎨',
        status: 'active'
      }
    ]);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/categories - Search functionality', () => {
    it('should search categories by name (case-insensitive)', async () => {
      const response = await request(app)
        .get('/api/categories?search=people')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('People');
    });

    it('should search categories by description', async () => {
      const response = await request(app)
        .get('/api/categories?search=landscapes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Nature');
    });

    it('should perform case-insensitive search', async () => {
      const response = await request(app)
        .get('/api/categories?search=NATURE')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Nature');
    });

    it('should search across both name and description', async () => {
      const response = await request(app)
        .get('/api/categories?search=draw')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should find categories that contain "draw" in name or description
      // "People" has "drawings" in description (active)
      // "Nature" has no "draw"
      // "Architecture" has "drawings" in description (inactive)
      // "Abstract" has "drawings" in description (active)
      expect(response.body.data).toHaveLength(3);
      
      const names = response.body.data.map(cat => cat.name);
      expect(names).toContain('People');
      expect(names).toContain('Architecture');
      expect(names).toContain('Abstract');
    });

    it('should combine search with status filter', async () => {
      const response = await request(app)
        .get('/api/categories?search=art&status=active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Abstract');
      expect(response.body.data[0].status).toBe('active');
    });

    it('should return empty array with message when no search results found', async () => {
      const response = await request(app)
        .get('/api/categories?search=nonexistent')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.message).toBe('No categories found matching search "nonexistent"');
    });

    it('should return empty array with message when status filter finds no results', async () => {
      // First delete all active categories
      await Category.updateMany({ status: 'active' }, { status: 'inactive' });
      
      const response = await request(app)
        .get('/api/categories?status=active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.message).toBe('No categories found with status "active"');
    });

    it('should return empty array with combined message when search and status find no results', async () => {
      const response = await request(app)
        .get('/api/categories?search=nonexistent&status=active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.message).toBe('No categories found matching search "nonexistent" with status "active"');
    });

    it('should return all categories without message when no filters applied', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(4);
      expect(response.body.message).toBeUndefined();
    });

    it('should filter by status only', async () => {
      const response = await request(app)
        .get('/api/categories?status=active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      
      response.body.data.forEach(category => {
        expect(category.status).toBe('active');
      });
    });
  });
});