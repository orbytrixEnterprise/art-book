const swaggerJsdoc = require('swagger-jsdoc');
const  env = require ('dotenv');
env.config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Drawing Document API',
      version: '1.0.0',
      description: 'A comprehensive RESTful API for managing drawing documents with image uploads via Cloudinary. Supports document CRUD operations, bulk image uploads, flexible image management, and cross-document image retrieval.',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `${process.env.SWAG_DEV}`,
        description: 'Development server'
      },
      {
        url: `${process.env.SWAG_PROD}`,
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Documents',
        description: 'Document management endpoints'
      },
      {
        name: 'Images',
        description: 'Image upload and management endpoints'
      },
      {
        name: 'Categories',
        description: 'Category management endpoints for organizing documents'
      }
    ]
  },
  apis: [
    './swagger/schemas/*.js',
    './swagger/paths/*.js',
    './swagger/components/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
