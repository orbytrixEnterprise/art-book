require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const Document = require('../models/Document');
const Category = require('../models/Category');
const connectDB = require('../config/database');
const apiRoutes = require('../routes');
const { errorHandler, notFoundHandler } = require('../middleware/errorHandler');

// Mock Cloudinary service
jest.mock('../services/CloudinaryService', () => ({
  deleteBulkImages: jest.fn().mockResolvedValue({
    success: true,
    deleted: 0,
    failed: 0,
    results: { successful: [], failed: [] }
  })
}));

// Create test app without starting server
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api', apiRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};

describe('Document API Integration Tests', () => {
  let app;
  let testCategory;

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Create test app
    app = createTestApp();
    
    // Connect to test database
    await connectDB();
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await Document.deleteMany({});
    await Category.deleteMany({});
    
    // Create a test category for use in tests
    testCategory = await Category.create({
      name: 'Test Category',
      description: 'A category for testing',
      status: 'active'
    });
    
    // Reset mock calls
    jest.clearAllMocks();
  });

  describe('POST /api/documents - Create Document', () => {
    it('should create a new document with valid data', async () => {
      const documentData = {
        title: 'Test Drawing',
        description: 'A test drawing document',
        category: testCategory._id.toString()
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.title).toBe(documentData.title);
      expect(response.body.data.description).toBe(documentData.description);
      expect(response.body.data.status).toBe('active'); // Default status
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
      expect(response.body.data.images).toEqual([]);
      expect(response.body.data.category).toHaveProperty('_id');
      expect(response.body.data.category.name).toBe(testCategory.name);
    });

    it('should create a document with specified status', async () => {
      const documentData = {
        title: 'Inactive Drawing',
        description: 'A deactivated drawing',
        category: testCategory._id.toString(),
        status: 'deactive'
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('deactive');
    });

    it('should fail when category is missing', async () => {
      const documentData = {
        title: 'Test Drawing',
        description: 'Missing category'
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Category is required');
    });

    it('should fail when category does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const documentData = {
        title: 'Test Drawing',
        description: 'Invalid category',
        category: fakeId.toString()
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Category not found');
    });

    it('should fail when category is inactive', async () => {
      const inactiveCategory = await Category.create({
        name: 'Inactive Category',
        description: 'An inactive category',
        status: 'inactive'
      });

      const documentData = {
        title: 'Test Drawing',
        description: 'Inactive category test',
        category: inactiveCategory._id.toString()
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Cannot assign document to inactive category');
    });

    it('should fail when title is missing', async () => {
      const documentData = {
        description: 'Missing title',
        category: testCategory._id.toString()
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Validation failed');
      expect(response.body.error.details).toContain('Title is required');
    });

    it('should fail when description is missing', async () => {
      const documentData = {
        title: 'Missing Description',
        category: testCategory._id.toString()
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Validation failed');
      expect(response.body.error.details).toContain('Description is required');
    });

    it('should fail with invalid status value', async () => {
      const documentData = {
        title: 'Test Drawing',
        description: 'Test description',
        category: testCategory._id.toString(),
        status: 'invalid'
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Validation failed');
      expect(response.body.error.details).toContain('Status must be either "active" or "deactive"');
    });
  });

  describe('GET /api/documents/:id - Get Document by ID', () => {
    it('should retrieve a document by ID', async () => {
      // Create a document first
      const document = await Document.create({
        title: 'Test Document',
        description: 'Test description',
        category: testCategory._id
      });

      const response = await request(app)
        .get(`/api/documents/${document._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(document._id.toString());
      expect(response.body.data.title).toBe(document.title);
      expect(response.body.data.description).toBe(document.description);
      expect(response.body.data.category).toHaveProperty('_id');
      expect(response.body.data.category.name).toBe(testCategory.name);
    });

    it('should return 404 for non-existent document', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/documents/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Document not found');
    });

    it('should return 400 for invalid document ID format', async () => {
      const response = await request(app)
        .get('/api/documents/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/documents - Get All Documents', () => {
    it('should retrieve all documents', async () => {
      // Create multiple documents
      await Document.create([
        { title: 'Document 1', description: 'Description 1', category: testCategory._id },
        { title: 'Document 2', description: 'Description 2', category: testCategory._id },
        { title: 'Document 3', description: 'Description 3', category: testCategory._id }
      ]);

      const response = await request(app)
        .get('/api/documents')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].category).toHaveProperty('_id');
    });

    it('should return empty array when no documents exist', async () => {
      const response = await request(app)
        .get('/api/documents')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should filter documents by status', async () => {
      // Create documents with different statuses
      await Document.create([
        { title: 'Active 1', description: 'Description 1', category: testCategory._id, status: 'active' },
        { title: 'Active 2', description: 'Description 2', category: testCategory._id, status: 'active' },
        { title: 'Inactive 1', description: 'Description 3', category: testCategory._id, status: 'deactive' }
      ]);

      const response = await request(app)
        .get('/api/documents?status=active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(doc => doc.status === 'active')).toBe(true);
    });

    it('should filter documents by deactive status', async () => {
      // Create documents with different statuses
      await Document.create([
        { title: 'Active 1', description: 'Description 1', category: testCategory._id, status: 'active' },
        { title: 'Inactive 1', description: 'Description 2', category: testCategory._id, status: 'deactive' },
        { title: 'Inactive 2', description: 'Description 3', category: testCategory._id, status: 'deactive' }
      ]);

      const response = await request(app)
        .get('/api/documents?status=deactive')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(doc => doc.status === 'deactive')).toBe(true);
    });

    it('should filter documents by category', async () => {
      // Create another category
      const category2 = await Category.create({
        name: 'Category 2',
        description: 'Second category',
        status: 'active'
      });

      // Create documents in different categories
      await Document.create([
        { title: 'Doc 1', description: 'Description 1', category: testCategory._id },
        { title: 'Doc 2', description: 'Description 2', category: testCategory._id },
        { title: 'Doc 3', description: 'Description 3', category: category2._id }
      ]);

      const response = await request(app)
        .get(`/api/documents?category=${testCategory._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(doc => doc.category._id === testCategory._id.toString())).toBe(true);
    });
  });

  describe('PUT /api/documents/:id - Update Document', () => {
    it('should update document title', async () => {
      const document = await Document.create({
        title: 'Original Title',
        description: 'Original Description',
        category: testCategory._id
      });

      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put(`/api/documents/${document._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.description).toBe(document.description);
    });

    it('should update document description', async () => {
      const document = await Document.create({
        title: 'Test Title',
        description: 'Original Description',
        category: testCategory._id
      });

      const updateData = {
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/documents/${document._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.title).toBe(document.title);
    });

    it('should update document category', async () => {
      const category2 = await Category.create({
        name: 'Category 2',
        description: 'Second category',
        status: 'active'
      });

      const document = await Document.create({
        title: 'Test Title',
        description: 'Test Description',
        category: testCategory._id
      });

      const updateData = {
        category: category2._id.toString()
      };

      const response = await request(app)
        .put(`/api/documents/${document._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.category._id).toBe(category2._id.toString());
      expect(response.body.data.category.name).toBe(category2.name);
    });

    it('should fail when updating to inactive category', async () => {
      const inactiveCategory = await Category.create({
        name: 'Inactive Category',
        description: 'An inactive category',
        status: 'inactive'
      });

      const document = await Document.create({
        title: 'Test Title',
        description: 'Test Description',
        category: testCategory._id
      });

      const updateData = {
        category: inactiveCategory._id.toString()
      };

      const response = await request(app)
        .put(`/api/documents/${document._id}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Cannot assign document to inactive category');
    });

    it('should update document status', async () => {
      const document = await Document.create({
        title: 'Test Title',
        description: 'Test Description',
        category: testCategory._id,
        status: 'active'
      });

      const updateData = {
        status: 'deactive'
      };

      const response = await request(app)
        .put(`/api/documents/${document._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('deactive');
    });

    it('should update multiple fields at once', async () => {
      const document = await Document.create({
        title: 'Original Title',
        description: 'Original Description',
        category: testCategory._id,
        status: 'active'
      });

      const updateData = {
        title: 'New Title',
        description: 'New Description',
        status: 'deactive'
      };

      const response = await request(app)
        .put(`/api/documents/${document._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it('should update updatedAt timestamp', async () => {
      const document = await Document.create({
        title: 'Test Title',
        description: 'Test Description',
        category: testCategory._id
      });

      const originalUpdatedAt = document.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await request(app)
        .put(`/api/documents/${document._id}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(new Date(response.body.data.updatedAt).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      );
    });

    it('should preserve createdAt timestamp', async () => {
      const document = await Document.create({
        title: 'Test Title',
        description: 'Test Description',
        category: testCategory._id
      });

      const originalCreatedAt = document.createdAt;

      const response = await request(app)
        .put(`/api/documents/${document._id}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.createdAt).toBe(originalCreatedAt.toISOString());
    });

    it('should return 404 for non-existent document', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/documents/${fakeId}`)
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Document not found');
    });

    it('should fail with invalid status value', async () => {
      const document = await Document.create({
        title: 'Test Title',
        description: 'Test Description',
        category: testCategory._id
      });

      const response = await request(app)
        .put(`/api/documents/${document._id}`)
        .send({ status: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Validation failed');
      expect(response.body.error.details).toContain('Status must be either "active" or "deactive"');
    });

    it('should fail when no fields are provided', async () => {
      const document = await Document.create({
        title: 'Test Title',
        description: 'Test Description',
        category: testCategory._id
      });

      const response = await request(app)
        .put(`/api/documents/${document._id}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('At least one field');
    });
  });

  describe('DELETE /api/documents/:id - Delete Document', () => {
    it('should delete a document successfully', async () => {
      const document = await Document.create({
        title: 'Test Document',
        description: 'Test Description',
        category: testCategory._id
      });

      const response = await request(app)
        .delete(`/api/documents/${document._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('deleted successfully');

      // Verify document is actually deleted
      const deletedDoc = await Document.findById(document._id);
      expect(deletedDoc).toBeNull();
    });

    it('should delete document with images and report count', async () => {
      const document = await Document.create({
        title: 'Test Document',
        description: 'Test Description',
        category: testCategory._id,
        images: [
          { cloudinaryId: 'img1', url: 'http://example.com/img1.jpg', order: 1 },
          { cloudinaryId: 'img2', url: 'http://example.com/img2.jpg', order: 2 }
        ]
      });

      const response = await request(app)
        .delete(`/api/documents/${document._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.deletedImages).toBe(2);

      // Verify document is deleted
      const deletedDoc = await Document.findById(document._id);
      expect(deletedDoc).toBeNull();
    });

    it('should return 404 for non-existent document', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/documents/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Document not found');
    });

    it('should return 400 for invalid document ID format', async () => {
      const response = await request(app)
        .delete('/api/documents/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
