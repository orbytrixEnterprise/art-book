require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger.config');
const connectDB = require('./config/database');
const { configureCloudinary } = require('./config/cloudinary');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Favicon handler to prevent 404 errors
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Drawing Document API is running',
    timestamp: new Date().toISOString()
  });
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Drawing Document API Documentation',
  customfavIcon: '/favicon.ico'
}));

// Mount API routes
app.use('/api', apiRoutes);

// Handle 404 - Not Found (must be after all routes)
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and Cloudinary
let server;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Configure Cloudinary
    configureCloudinary();

    // Initialize default category
    try {
      const categoryService = require('./services/CategoryService');
      const result = await categoryService.initializeDefaultCategory();
      
      if (result.created) {
        console.log('✓ Default category created:', result.category.name);
      } else {
        console.log('✓ Default category already exists:', result.category.name);
      }
    } catch (error) {
      console.error('⚠ Warning: Failed to initialize default category:', error.message);
      console.error('  The server will continue, but category functionality may be limited.');
    }

    // Start server
    const PORT = process.env.PORT || 3000;
    server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`${signal} signal received: starting graceful shutdown`);
  
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');
      
      // Close MongoDB connection
      try {
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
      } catch (error) {
        console.error('Error closing MongoDB connection:', error.message);
      }
      
      console.log('Graceful shutdown completed');
      process.exit(0);
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();

module.exports = app;
