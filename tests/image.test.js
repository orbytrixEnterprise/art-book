require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const Document = require('../models/Document');
const connectDB = require('../config/database');
const apiRoutes = require('../routes');
const { errorHandler, notFoundHandler } = require('../middleware/errorHandler');

// Mock Cloudinary service
const mockUploadImage = jest.fn();
const mockDeleteImage = jest.fn();
const mockDeleteBulkImages = jest.fn();

jest.mock('../services/CloudinaryService', () => ({
  uploadImage: (...args) => mockUploadImage(...args),
  deleteImage: (...args) => mockDeleteImage(...args),
  deleteBulkImages: (...args) => mockDeleteBulkImages(...args)
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

describe('Image API Integration Tests', () => {
  let app;
  let testDocument;

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
    // Clear documents collection before each test
    await Document.deleteMany({});
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a test document for image operations
    testDocument = await Document.create({
      title: 'Test Document',
      description: 'Test Description'
    });
    
    // Setup default mock implementations
    mockUploadImage.mockResolvedValue({
      cloudinaryId: 'test-cloudinary-id',
      url: 'https://res.cloudinary.com/test/image.jpg',
      width: 800,
      height: 600,
      format: 'jpg'
    });
    
    mockDeleteImage.mockResolvedValue({
      success: true,
      cloudinaryId: 'test-cloudinary-id',
      result: 'ok'
    });
    
    mockDeleteBulkImages.mockResolvedValue({
      success: true,
      deleted: 0,
      failed: 0,
      results: { successful: [], failed: [] }
    });
  });

  describe('POST /api/documents/:id/images - Upload Single Image', () => {
    it('should upload a single image to a document', async () => {
      const response = await request(app)
        .post(`/api/documents/${testDocument._id}/images`)
        .attach('image', Buffer.from('fake-image-data'), 'test-image.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.images).toHaveLength(1);
      expect(response.body.data.images[0]).toMatchObject({
        cloudinaryId: 'test-cloudinary-id',
        url: 'https://res.cloudinary.com/test/image.jpg',
        order: 1
      });
      
      // Verify Cloudinary upload was called
      expect(mockUploadImage).toHaveBeenCalledTimes(1);
    });

    it('should assign correct order when adding image to document with existing images', async () => {
      // Add initial images
      testDocument.images.push(
        { cloudinaryId: 'img1', url: 'http://example.com/img1.jpg', order: 1 },
        { cloudinaryId: 'img2', url: 'http://example.com/img2.jpg', order: 2 }
      );
      await testDocument.save();

      const response = await request(app)
        .post(`/api/documents/${testDocument._id}/images`)
        .attach('image', Buffer.from('fake-image-data'), 'test-image.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toHaveLength(3);
      expect(response.body.data.images[2].order).toBe(3);
    });

    it('should fail when no image file is provided', async () => {
      const response = await request(app)
        .post(`/api/documents/${testDocument._id}/images`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('No file uploaded. Please provide an image file');
      expect(mockUploadImage).not.toHaveBeenCalled();
    });

    it('should return 404 for non-existent document', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/documents/${fakeId}/images`)
        .attach('image', Buffer.from('fake-image-data'), 'test-image.jpg')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Document not found');
    });

    it('should handle Cloudinary upload failure', async () => {
      mockUploadImage.mockRejectedValueOnce(new Error('Cloudinary upload failed: Network error'));

      const response = await request(app)
        .post(`/api/documents/${testDocument._id}/images`)
        .attach('image', Buffer.from('fake-image-data'), 'test-image.jpg')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Failed to upload image');
      
      // Verify document was not modified
      const doc = await Document.findById(testDocument._id);
      expect(doc.images).toHaveLength(0);
    });
  });

  describe('POST /api/documents/:id/images/bulk - Upload Multiple Images', () => {
    it('should upload multiple images successfully', async () => {
      mockUploadImage
        .mockResolvedValueOnce({
          cloudinaryId: 'img1-id',
          url: 'https://res.cloudinary.com/test/img1.jpg',
          width: 800,
          height: 600,
          format: 'jpg'
        })
        .mockResolvedValueOnce({
          cloudinaryId: 'img2-id',
          url: 'https://res.cloudinary.com/test/img2.jpg',
          width: 800,
          height: 600,
          format: 'jpg'
        })
        .mockResolvedValueOnce({
          cloudinaryId: 'img3-id',
          url: 'https://res.cloudinary.com/test/img3.jpg',
          width: 800,
          height: 600,
          format: 'jpg'
        });

      const response = await request(app)
        .post(`/api/documents/${testDocument._id}/images/bulk`)
        .attach('images', Buffer.from('fake-image-1'), 'image1.jpg')
        .attach('images', Buffer.from('fake-image-2'), 'image2.jpg')
        .attach('images', Buffer.from('fake-image-3'), 'image3.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.document.images).toHaveLength(3);
      expect(response.body.data.uploadResults).toMatchObject({
        successful: 3,
        failed: 0,
        failures: []
      });
      
      // Verify images have sequential order
      expect(response.body.data.document.images[0].order).toBe(1);
      expect(response.body.data.document.images[1].order).toBe(2);
      expect(response.body.data.document.images[2].order).toBe(3);
      
      expect(mockUploadImage).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures in bulk upload', async () => {
      mockUploadImage
        .mockResolvedValueOnce({
          cloudinaryId: 'img1-id',
          url: 'https://res.cloudinary.com/test/img1.jpg',
          width: 800,
          height: 600,
          format: 'jpg'
        })
        .mockRejectedValueOnce(new Error('Upload timeout'))
        .mockResolvedValueOnce({
          cloudinaryId: 'img3-id',
          url: 'https://res.cloudinary.com/test/img3.jpg',
          width: 800,
          height: 600,
          format: 'jpg'
        });

      const response = await request(app)
        .post(`/api/documents/${testDocument._id}/images/bulk`)
        .attach('images', Buffer.from('fake-image-1'), 'image1.jpg')
        .attach('images', Buffer.from('fake-image-2'), 'image2.jpg')
        .attach('images', Buffer.from('fake-image-3'), 'image3.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.document.images).toHaveLength(2);
      expect(response.body.data.uploadResults).toMatchObject({
        successful: 2,
        failed: 1
      });
      expect(response.body.data.uploadResults.failures).toHaveLength(1);
      expect(response.body.data.uploadResults.failures[0]).toMatchObject({
        filename: 'image2.jpg',
        error: expect.stringContaining('Upload timeout')
      });
    });

    it('should assign correct order values when document has existing images', async () => {
      // Add initial images
      testDocument.images.push(
        { cloudinaryId: 'existing1', url: 'http://example.com/img1.jpg', order: 1 },
        { cloudinaryId: 'existing2', url: 'http://example.com/img2.jpg', order: 2 }
      );
      await testDocument.save();

      mockUploadImage
        .mockResolvedValueOnce({
          cloudinaryId: 'new1-id',
          url: 'https://res.cloudinary.com/test/new1.jpg',
          width: 800,
          height: 600,
          format: 'jpg'
        })
        .mockResolvedValueOnce({
          cloudinaryId: 'new2-id',
          url: 'https://res.cloudinary.com/test/new2.jpg',
          width: 800,
          height: 600,
          format: 'jpg'
        });

      const response = await request(app)
        .post(`/api/documents/${testDocument._id}/images/bulk`)
        .attach('images', Buffer.from('fake-image-1'), 'new1.jpg')
        .attach('images', Buffer.from('fake-image-2'), 'new2.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.document.images).toHaveLength(4);
      expect(response.body.data.document.images[2].order).toBe(3);
      expect(response.body.data.document.images[3].order).toBe(4);
    });

    it('should fail when no image files are provided', async () => {
      const response = await request(app)
        .post(`/api/documents/${testDocument._id}/images/bulk`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('No files uploaded. Please provide at least one image file');
      expect(mockUploadImage).not.toHaveBeenCalled();
    });

    it('should return 404 for non-existent document', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/documents/${fakeId}/images/bulk`)
        .attach('images', Buffer.from('fake-image-1'), 'image1.jpg')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Document not found');
    });

    it('should save successful uploads even when all uploads fail', async () => {
      mockUploadImage
        .mockRejectedValueOnce(new Error('Upload failed 1'))
        .mockRejectedValueOnce(new Error('Upload failed 2'));

      const response = await request(app)
        .post(`/api/documents/${testDocument._id}/images/bulk`)
        .attach('images', Buffer.from('fake-image-1'), 'image1.jpg')
        .attach('images', Buffer.from('fake-image-2'), 'image2.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.document.images).toHaveLength(0);
      expect(response.body.data.uploadResults).toMatchObject({
        successful: 0,
        failed: 2
      });
    });
  });

  describe('DELETE /api/documents/:id/images/:imageId - Remove Single Image', () => {
    beforeEach(async () => {
      // Add test images to document
      testDocument.images.push(
        { cloudinaryId: 'img1', url: 'http://example.com/img1.jpg', order: 1 },
        { cloudinaryId: 'img2', url: 'http://example.com/img2.jpg', order: 2 },
        { cloudinaryId: 'img3', url: 'http://example.com/img3.jpg', order: 3 }
      );
      await testDocument.save();
    });

    it('should remove an image and reorder remaining images', async () => {
      const imageToRemove = testDocument.images[1]._id;

      const response = await request(app)
        .delete(`/api/documents/${testDocument._id}/images/${imageToRemove}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toHaveLength(2);
      
      // Verify remaining images are reordered sequentially
      expect(response.body.data.images[0].order).toBe(1);
      expect(response.body.data.images[1].order).toBe(2);
      
      // Verify Cloudinary delete was called
      expect(mockDeleteImage).toHaveBeenCalledWith('img2');
    });

    it('should remove first image and reorder correctly', async () => {
      const imageToRemove = testDocument.images[0]._id;

      const response = await request(app)
        .delete(`/api/documents/${testDocument._id}/images/${imageToRemove}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toHaveLength(2);
      expect(response.body.data.images[0].cloudinaryId).toBe('img2');
      expect(response.body.data.images[0].order).toBe(1);
      expect(response.body.data.images[1].cloudinaryId).toBe('img3');
      expect(response.body.data.images[1].order).toBe(2);
    });

    it('should remove last image without affecting others', async () => {
      const imageToRemove = testDocument.images[2]._id;

      const response = await request(app)
        .delete(`/api/documents/${testDocument._id}/images/${imageToRemove}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toHaveLength(2);
      expect(response.body.data.images[0].order).toBe(1);
      expect(response.body.data.images[1].order).toBe(2);
    });

    it('should return 404 for non-existent image', async () => {
      const fakeImageId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/documents/${testDocument._id}/images/${fakeImageId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Image not found');
      expect(mockDeleteImage).not.toHaveBeenCalled();
    });

    it('should return 404 for non-existent document', async () => {
      const fakeDocId = new mongoose.Types.ObjectId();
      const fakeImageId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/documents/${fakeDocId}/images/${fakeImageId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Document not found');
    });

    it('should handle Cloudinary deletion failure', async () => {
      mockDeleteImage.mockRejectedValueOnce(new Error('Cloudinary deletion failed'));

      const imageToRemove = testDocument.images[0]._id;

      const response = await request(app)
        .delete(`/api/documents/${testDocument._id}/images/${imageToRemove}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Failed to delete image');
    });
  });

  describe('DELETE /api/documents/:id/images - Remove Multiple Images', () => {
    beforeEach(async () => {
      // Add test images to document
      testDocument.images.push(
        { cloudinaryId: 'img1', url: 'http://example.com/img1.jpg', order: 1 },
        { cloudinaryId: 'img2', url: 'http://example.com/img2.jpg', order: 2 },
        { cloudinaryId: 'img3', url: 'http://example.com/img3.jpg', order: 3 },
        { cloudinaryId: 'img4', url: 'http://example.com/img4.jpg', order: 4 }
      );
      await testDocument.save();
    });

    it('should remove multiple images and reorder remaining', async () => {
      const imageIds = [
        testDocument.images[1]._id.toString(),
        testDocument.images[3]._id.toString()
      ];

      const response = await request(app)
        .delete(`/api/documents/${testDocument._id}/images`)
        .send({ imageIds })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toHaveLength(2);
      expect(response.body.data.images[0].cloudinaryId).toBe('img1');
      expect(response.body.data.images[0].order).toBe(1);
      expect(response.body.data.images[1].cloudinaryId).toBe('img3');
      expect(response.body.data.images[1].order).toBe(2);
      
      // Verify bulk delete was called
      expect(mockDeleteBulkImages).toHaveBeenCalledWith(['img2', 'img4']);
    });

    it('should fail when imageIds array is missing', async () => {
      const response = await request(app)
        .delete(`/api/documents/${testDocument._id}/images`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Array of image IDs is required');
    });

    it('should fail when imageIds is not an array', async () => {
      const response = await request(app)
        .delete(`/api/documents/${testDocument._id}/images`)
        .send({ imageIds: 'not-an-array' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Array of image IDs is required');
    });

    it('should fail when imageIds array is empty', async () => {
      const response = await request(app)
        .delete(`/api/documents/${testDocument._id}/images`)
        .send({ imageIds: [] })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Array of image IDs is required');
    });

    it('should return 404 when no valid images found', async () => {
      const fakeIds = [
        new mongoose.Types.ObjectId().toString(),
        new mongoose.Types.ObjectId().toString()
      ];

      const response = await request(app)
        .delete(`/api/documents/${testDocument._id}/images`)
        .send({ imageIds: fakeIds })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('No valid images found');
    });
  });

  describe('PUT /api/documents/:id/images/reorder - Reorder Images', () => {
    beforeEach(async () => {
      // Add test images to document
      testDocument.images.push(
        { cloudinaryId: 'img1', url: 'http://example.com/img1.jpg', order: 1 },
        { cloudinaryId: 'img2', url: 'http://example.com/img2.jpg', order: 2 },
        { cloudinaryId: 'img3', url: 'http://example.com/img3.jpg', order: 3 }
      );
      await testDocument.save();
    });

    it('should reorder images successfully', async () => {
      const imageOrders = [
        { imageId: testDocument.images[0]._id.toString(), order: 3 },
        { imageId: testDocument.images[1]._id.toString(), order: 1 },
        { imageId: testDocument.images[2]._id.toString(), order: 2 }
      ];

      const response = await request(app)
        .put(`/api/documents/${testDocument._id}/images/reorder`)
        .send({ imageOrders })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toHaveLength(3);
      
      // Verify new order
      const sortedImages = response.body.data.images.sort((a, b) => a.order - b.order);
      expect(sortedImages[0].cloudinaryId).toBe('img2');
      expect(sortedImages[1].cloudinaryId).toBe('img3');
      expect(sortedImages[2].cloudinaryId).toBe('img1');
    });

    it('should update updatedAt timestamp when reordering', async () => {
      const originalUpdatedAt = testDocument.updatedAt;
      
      await new Promise(resolve => setTimeout(resolve, 100));

      const imageOrders = [
        { imageId: testDocument.images[0]._id.toString(), order: 2 },
        { imageId: testDocument.images[1]._id.toString(), order: 1 },
        { imageId: testDocument.images[2]._id.toString(), order: 3 }
      ];

      const response = await request(app)
        .put(`/api/documents/${testDocument._id}/images/reorder`)
        .send({ imageOrders })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(new Date(response.body.data.updatedAt).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      );
    });

    it('should fail when imageOrders array is missing', async () => {
      const response = await request(app)
        .put(`/api/documents/${testDocument._id}/images/reorder`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('imageOrders array is required');
    });

    it('should fail when imageOrders is not an array', async () => {
      const response = await request(app)
        .put(`/api/documents/${testDocument._id}/images/reorder`)
        .send({ imageOrders: 'not-an-array' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('imageOrders must be an array');
    });

    it('should fail when imageOrders array is empty', async () => {
      const response = await request(app)
        .put(`/api/documents/${testDocument._id}/images/reorder`)
        .send({ imageOrders: [] })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('imageOrders array cannot be empty');
    });

    it('should fail when items are missing imageId or order', async () => {
      const imageOrders = [
        { imageId: testDocument.images[0]._id.toString() }, // Missing order
        { order: 2 } // Missing imageId
      ];

      const response = await request(app)
        .put(`/api/documents/${testDocument._id}/images/reorder`)
        .send({ imageOrders })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Image reorder validation failed');
      expect(response.body.error.details).toBeDefined();
    });

    it('should fail with duplicate order values', async () => {
      const imageOrders = [
        { imageId: testDocument.images[0]._id.toString(), order: 1 },
        { imageId: testDocument.images[1]._id.toString(), order: 1 }, // Duplicate
        { imageId: testDocument.images[2]._id.toString(), order: 2 }
      ];

      const response = await request(app)
        .put(`/api/documents/${testDocument._id}/images/reorder`)
        .send({ imageOrders })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Image reorder validation failed');
      expect(response.body.error.details).toBeDefined();
    });

    it('should fail with invalid imageId', async () => {
      const fakeImageId = new mongoose.Types.ObjectId();
      const imageOrders = [
        { imageId: testDocument.images[0]._id.toString(), order: 1 },
        { imageId: fakeImageId.toString(), order: 2 },
        { imageId: testDocument.images[2]._id.toString(), order: 3 }
      ];

      const response = await request(app)
        .put(`/api/documents/${testDocument._id}/images/reorder`)
        .send({ imageOrders })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid image IDs');
    });

    it('should fail with non-positive order values', async () => {
      const imageOrders = [
        { imageId: testDocument.images[0]._id.toString(), order: 0 },
        { imageId: testDocument.images[1]._id.toString(), order: 1 },
        { imageId: testDocument.images[2]._id.toString(), order: 2 }
      ];

      const response = await request(app)
        .put(`/api/documents/${testDocument._id}/images/reorder`)
        .send({ imageOrders })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Image reorder validation failed');
      expect(response.body.error.details).toBeDefined();
    });

    it('should return 404 for non-existent document', async () => {
      const fakeDocId = new mongoose.Types.ObjectId();
      const imageOrders = [
        { imageId: testDocument.images[0]._id.toString(), order: 1 }
      ];

      const response = await request(app)
        .put(`/api/documents/${fakeDocId}/images/reorder`)
        .send({ imageOrders })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Document not found');
    });
  });

  describe('GET /api/documents/:id/images - Get Document Images', () => {
    it('should retrieve all images for a document in order', async () => {
      // Add test images
      testDocument.images.push(
        { cloudinaryId: 'img1', url: 'http://example.com/img1.jpg', order: 1 },
        { cloudinaryId: 'img2', url: 'http://example.com/img2.jpg', order: 2 },
        { cloudinaryId: 'img3', url: 'http://example.com/img3.jpg', order: 3 }
      );
      await testDocument.save();

      const response = await request(app)
        .get(`/api/documents/${testDocument._id}/images`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].order).toBe(1);
      expect(response.body.data[1].order).toBe(2);
      expect(response.body.data[2].order).toBe(3);
      expect(response.body.data[0]).toHaveProperty('cloudinaryId');
      expect(response.body.data[0]).toHaveProperty('url');
    });

    it('should return empty array for document with no images', async () => {
      const response = await request(app)
        .get(`/api/documents/${testDocument._id}/images`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return images sorted by order value', async () => {
      // Add images in non-sequential order
      testDocument.images.push(
        { cloudinaryId: 'img3', url: 'http://example.com/img3.jpg', order: 3 },
        { cloudinaryId: 'img1', url: 'http://example.com/img1.jpg', order: 1 },
        { cloudinaryId: 'img2', url: 'http://example.com/img2.jpg', order: 2 }
      );
      await testDocument.save();

      const response = await request(app)
        .get(`/api/documents/${testDocument._id}/images`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].cloudinaryId).toBe('img1');
      expect(response.body.data[1].cloudinaryId).toBe('img2');
      expect(response.body.data[2].cloudinaryId).toBe('img3');
    });

    it('should return 404 for non-existent document', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/documents/${fakeId}/images`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Document not found');
    });

    it('should return 400 for invalid document ID format', async () => {
      const response = await request(app)
        .get('/api/documents/invalid-id/images')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/images/multi-document - Get Multi-Document Images', () => {
    let doc1, doc2, doc3;

    beforeEach(async () => {
      // Create multiple documents with images
      doc1 = await Document.create({
        title: 'Document 1',
        description: 'First document',
        images: [
          { cloudinaryId: 'doc1-img1', url: 'http://example.com/doc1-img1.jpg', order: 1 },
          { cloudinaryId: 'doc1-img2', url: 'http://example.com/doc1-img2.jpg', order: 2 }
        ]
      });

      doc2 = await Document.create({
        title: 'Document 2',
        description: 'Second document',
        images: [
          { cloudinaryId: 'doc2-img1', url: 'http://example.com/doc2-img1.jpg', order: 1 }
        ]
      });

      doc3 = await Document.create({
        title: 'Document 3',
        description: 'Third document with no images'
      });
    });

    it('should retrieve images from multiple documents', async () => {
      const documentIds = [doc1._id.toString(), doc2._id.toString()];

      const response = await request(app)
        .post('/api/images/multi-document')
        .send({ documentIds })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.documents).toHaveProperty(doc1._id.toString());
      expect(response.body.data.documents).toHaveProperty(doc2._id.toString());
      
      expect(response.body.data.documents[doc1._id.toString()].images).toHaveLength(2);
      expect(response.body.data.documents[doc2._id.toString()].images).toHaveLength(1);
    });

    it('should include document title with images', async () => {
      const documentIds = [doc1._id.toString()];

      const response = await request(app)
        .post('/api/images/multi-document')
        .send({ documentIds })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.documents[doc1._id.toString()]).toMatchObject({
        documentId: doc1._id.toString(),
        title: 'Document 1',
        images: expect.any(Array)
      });
    });

    it('should return empty array for documents with no images', async () => {
      const documentIds = [doc3._id.toString()];

      const response = await request(app)
        .post('/api/images/multi-document')
        .send({ documentIds })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.documents[doc3._id.toString()].images).toEqual([]);
    });

    it('should handle mix of valid and invalid document IDs', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const documentIds = [doc1._id.toString(), fakeId, doc2._id.toString()];

      const response = await request(app)
        .post('/api/images/multi-document')
        .send({ documentIds })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.documents[doc1._id.toString()].images).toHaveLength(2);
      expect(response.body.data.documents[doc2._id.toString()].images).toHaveLength(1);
      expect(response.body.data.documents[fakeId].images).toEqual([]);
      expect(response.body.data.invalidIds).toContain(fakeId);
    });

    it('should return images grouped by document ID', async () => {
      const documentIds = [doc1._id.toString(), doc2._id.toString(), doc3._id.toString()];

      const response = await request(app)
        .post('/api/images/multi-document')
        .send({ documentIds })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Object.keys(response.body.data.documents)).toHaveLength(3);
      
      // Verify each document has its own images
      expect(response.body.data.documents[doc1._id.toString()].images[0].cloudinaryId).toBe('doc1-img1');
      expect(response.body.data.documents[doc2._id.toString()].images[0].cloudinaryId).toBe('doc2-img1');
    });

    it('should fail when documentIds array is missing', async () => {
      const response = await request(app)
        .post('/api/images/multi-document')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Array of document IDs is required');
    });

    it('should fail when documentIds is not an array', async () => {
      const response = await request(app)
        .post('/api/images/multi-document')
        .send({ documentIds: 'not-an-array' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Array of document IDs is required');
    });

    it('should fail when documentIds array is empty', async () => {
      const response = await request(app)
        .post('/api/images/multi-document')
        .send({ documentIds: [] })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Array of document IDs is required');
    });

    it('should return images sorted by order within each document', async () => {
      const documentIds = [doc1._id.toString()];

      const response = await request(app)
        .post('/api/images/multi-document')
        .send({ documentIds })
        .expect(200);

      expect(response.body.success).toBe(true);
      const images = response.body.data.documents[doc1._id.toString()].images;
      expect(images[0].order).toBe(1);
      expect(images[1].order).toBe(2);
    });
  });
});
