# Design Document - Category System

## Overview

The Category System adds hierarchical organization to the Drawing Document API by allowing documents to be classified into parent categories (e.g., People, Nature, Architecture, Abstract). This design integrates seamlessly with the existing document structure while maintaining backward compatibility.

## Architecture

### System Integration

```
┌─────────────────────────────────────────────────────────┐
│                   Client Applications                    │
│            (API Consumers, Admin Panel)                  │
└─────────────────────────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Express.js Server                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Category Routes                      │  │
│  │  /api/categories (CRUD operations)               │  │
│  │  /api/categories/:id/documents                   │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Updated Document Routes                   │  │
│  │  /api/documents (now includes category filter)   │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Category Controller                    │  │
│  │  Handles category CRUD operations                │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Category Service                       │  │
│  │  Business logic for categories                   │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Updated Document Service                  │  │
│  │  Now validates category references               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    MongoDB Database                      │
│  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │   Categories     │  │      Documents           │    │
│  │   Collection     │◄─┤  (with category ref)     │    │
│  └──────────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Data Models

### Category Model

```javascript
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  icon: {
    type: String,
    default: '📁', // Default folder emoji
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive'],
      message: 'Status must be either active or inactive'
    },
    default: 'active'
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ status: 1 });
categorySchema.index({ displayOrder: 1, name: 1 });

// Virtual for document count
categorySchema.virtual('documentCount', {
  ref: 'Document',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Method to generate slug from name
categorySchema.methods.generateSlug = function() {
  let slug = this.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-');      // Replace multiple hyphens with single
  
  return slug;
};

// Pre-save hook to generate slug
categorySchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    let slug = this.generateSlug();
    let slugExists = true;
    let counter = 1;
    
    // Ensure slug is unique
    while (slugExists) {
      const existing = await this.constructor.findOne({ 
        slug: slug,
        _id: { $ne: this._id }
      });
      
      if (!existing) {
        slugExists = false;
      } else {
        slug = `${this.generateSlug()}-${counter}`;
        counter++;
      }
    }
    
    this.slug = slug;
  }
  next();
});
```

### Updated Document Model

```javascript
const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'deactive'],
      message: 'Status must be either active or deactive'
    },
    default: 'active'
  },
  main_image: {
    cloudinaryId: {
      type: String,
      default: null
    },
    url: {
      type: String,
      default: null
    }
  },
  images: [{
    cloudinaryId: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Indexes
documentSchema.index({ category: 1, status: 1 });
documentSchema.index({ category: 1, createdAt: -1 });
```

## Components and Interfaces

### 1. Category Service

```javascript
class CategoryService {
  /**
   * Create a new category
   */
  async createCategory(data) {
    // Validate name uniqueness
    // Create category with auto-generated slug
    // Set display order
    // Return created category
  }
  
  /**
   * Get all categories with optional filters
   */
  async getAllCategories(filters = {}) {
    // Apply status filter if provided
    // Sort by displayOrder, then name
    // Populate document count
    // Return categories
  }
  
  /**
   * Get category by ID
   */
  async getCategoryById(id) {
    // Find category
    // Populate document count
    // Return category or throw 404
  }
  
  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug) {
    // Find category by slug
    // Populate document count
    // Return category or throw 404
  }
  
  /**
   * Update category
   */
  async updateCategory(id, data) {
    // Validate name uniqueness if changed
    // Update category
    // Regenerate slug if name changed
    // Return updated category
  }
  
  /**
   * Delete category
   */
  async deleteCategory(id) {
    // Check if category is default
    // Check if category has documents
    // Delete if no documents
    // Return success or throw error
  }
  
  /**
   * Get documents by category
   */
  async getDocumentsByCategory(categoryId, options = {}) {
    // Validate category exists
    // Query documents with pagination
    // Return documents
  }
  
  /**
   * Reorder categories
   */
  async reorderCategories(orderArray) {
    // Update displayOrder for each category
    // Return updated categories
  }
  
  /**
   * Get category statistics
   */
  async getCategoryStatistics() {
    // Aggregate document counts per category
    // Return statistics
  }
  
  /**
   * Initialize default category
   */
  async initializeDefaultCategory() {
    // Check if default category exists
    // Create "Uncategorized" if not exists
    // Return default category
  }
}
```

### 2. Category Controller

```javascript
class CategoryController {
  /**
   * POST /api/categories
   * Create a new category
   */
  async createCategory(req, res, next) {
    // Validate request body
    // Call categoryService.createCategory
    // Return 201 with created category
  }
  
  /**
   * GET /api/categories
   * Get all categories
   */
  async getAllCategories(req, res, next) {
    // Parse query params (status, search)
    // Call categoryService.getAllCategories
    // Return 200 with categories
  }
  
  /**
   * GET /api/categories/:id
   * Get category by ID
   */
  async getCategoryById(req, res, next) {
    // Call categoryService.getCategoryById
    // Return 200 with category
  }
  
  /**
   * GET /api/categories/slug/:slug
   * Get category by slug
   */
  async getCategoryBySlug(req, res, next) {
    // Call categoryService.getCategoryBySlug
    // Return 200 with category
  }
  
  /**
   * PUT /api/categories/:id
   * Update category
   */
  async updateCategory(req, res, next) {
    // Validate request body
    // Call categoryService.updateCategory
    // Return 200 with updated category
  }
  
  /**
   * DELETE /api/categories/:id
   * Delete category
   */
  async deleteCategory(req, res, next) {
    // Call categoryService.deleteCategory
    // Return 200 with success message
  }
  
  /**
   * GET /api/categories/:id/documents
   * Get documents by category
   */
  async getDocumentsByCategory(req, res, next) {
    // Parse pagination params
    // Call categoryService.getDocumentsByCategory
    // Return 200 with documents
  }
  
  /**
   * PUT /api/categories/reorder
   * Reorder categories
   */
  async reorderCategories(req, res, next) {
    // Validate order array
    // Call categoryService.reorderCategories
    // Return 200 with success
  }
  
  /**
   * GET /api/categories/statistics
   * Get category statistics
   */
  async getCategoryStatistics(req, res, next) {
    // Call categoryService.getCategoryStatistics
    // Return 200 with statistics
  }
}
```

### 3. Updated Document Service

```javascript
class DocumentService {
  /**
   * Create document (updated to validate category)
   */
  async createDocument(data) {
    // Validate category exists and is active
    // Create document with category reference
    // Return created document with populated category
  }
  
  /**
   * Update document (updated to validate category)
   */
  async updateDocument(id, data) {
    // If category is being changed, validate new category
    // Update document
    // Return updated document with populated category
  }
  
  /**
   * Get all documents (updated to support category filter)
   */
  async getAllDocuments(filters = {}) {
    // Apply category filter if provided
    // Apply other filters
    // Populate category information
    // Return documents
  }
  
  /**
   * Get document by ID (updated to populate category)
   */
  async getDocumentById(id) {
    // Find document
    // Populate category information
    // Return document
  }
}
```

## API Endpoints

### Category Endpoints

```
POST   /api/categories                    - Create category
GET    /api/categories                    - Get all categories
GET    /api/categories/:id                - Get category by ID
GET    /api/categories/slug/:slug         - Get category by slug
PUT    /api/categories/:id                - Update category
DELETE /api/categories/:id                - Delete category
GET    /api/categories/:id/documents      - Get documents in category
PUT    /api/categories/reorder            - Reorder categories
GET    /api/categories/statistics         - Get category statistics
```

### Updated Document Endpoints

```
POST   /api/documents                     - Create document (now requires category)
GET    /api/documents                     - Get all documents (now supports category filter)
GET    /api/documents/:id                 - Get document (now includes category info)
PUT    /api/documents/:id                 - Update document (can change category)
DELETE /api/documents/:id                 - Delete document
```

## Request/Response Examples

### Create Category

**Request:**
```json
POST /api/categories
{
  "name": "People",
  "description": "Portraits and people-related drawings",
  "icon": "👤",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "People",
    "slug": "people",
    "description": "Portraits and people-related drawings",
    "icon": "👤",
    "status": "active",
    "displayOrder": 1,
    "isDefault": false,
    "documentCount": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get All Categories

**Request:**
```
GET /api/categories?status=active
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "People",
      "slug": "people",
      "description": "Portraits and people-related drawings",
      "icon": "👤",
      "status": "active",
      "displayOrder": 1,
      "documentCount": 15,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Nature",
      "slug": "nature",
      "description": "Landscapes and natural scenes",
      "icon": "🌿",
      "status": "active",
      "displayOrder": 2,
      "documentCount": 23,
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

### Create Document with Category

**Request:**
```json
POST /api/documents
{
  "title": "Portrait Study",
  "description": "A detailed portrait drawing",
  "category": "507f1f77bcf86cd799439011",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "title": "Portrait Study",
    "description": "A detailed portrait drawing",
    "category": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "People",
      "slug": "people",
      "icon": "👤"
    },
    "status": "active",
    "main_image": {
      "cloudinaryId": null,
      "url": null
    },
    "images": [],
    "createdAt": "2024-01-15T14:30:00.000Z",
    "updatedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

### Get Documents by Category

**Request:**
```
GET /api/categories/507f1f77bcf86cd799439011/documents?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "People",
      "slug": "people",
      "icon": "👤"
    },
    "documents": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "title": "Portrait Study",
        "description": "A detailed portrait drawing",
        "status": "active",
        "main_image": {
          "url": "https://res.cloudinary.com/..."
        },
        "images": [],
        "createdAt": "2024-01-15T14:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalDocuments": 15,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

## Migration Strategy

### Migration Script

```javascript
// migrations/add-category-system.js

async function migrateToCategories() {
  // 1. Create default "Uncategorized" category
  const defaultCategory = await Category.create({
    name: 'Uncategorized',
    slug: 'uncategorized',
    description: 'Documents without a specific category',
    icon: '📁',
    status: 'active',
    displayOrder: 999,
    isDefault: true
  });
  
  // 2. Update all existing documents to reference default category
  const result = await Document.updateMany(
    { category: { $exists: false } },
    { $set: { category: defaultCategory._id } }
  );
  
  console.log(`Migrated ${result.modifiedCount} documents to default category`);
  
  // 3. Create index on category field
  await Document.collection.createIndex({ category: 1 });
  
  return {
    success: true,
    defaultCategoryId: defaultCategory._id,
    migratedDocuments: result.modifiedCount
  };
}
```

## Validation Rules

### Category Validation

```javascript
const categoryValidation = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 100,
    unique: true
  },
  description: {
    required: false,
    maxLength: 500
  },
  icon: {
    required: false,
    maxLength: 10
  },
  status: {
    required: false,
    enum: ['active', 'inactive']
  }
};
```

### Document Validation (Updated)

```javascript
const documentValidation = {
  title: {
    required: true,
    maxLength: 200
  },
  description: {
    required: true,
    maxLength: 2000
  },
  category: {
    required: true,
    type: 'ObjectId',
    validateExists: true,
    validateActive: true
  },
  status: {
    required: false,
    enum: ['active', 'deactive']
  }
};
```

## Error Handling

### Category-Specific Errors

```javascript
// Duplicate category name
{
  "success": false,
  "error": {
    "message": "Category name 'People' already exists",
    "code": "DUPLICATE_CATEGORY_NAME"
  }
}

// Category has documents (cannot delete)
{
  "success": false,
  "error": {
    "message": "Cannot delete category 'People' because it has 15 assigned documents",
    "code": "CATEGORY_IN_USE",
    "details": {
      "documentCount": 15
    }
  }
}

// Category not found
{
  "success": false,
  "error": {
    "message": "Category not found",
    "code": "NOT_FOUND"
  }
}

// Invalid category (inactive)
{
  "success": false,
  "error": {
    "message": "Cannot assign document to inactive category",
    "code": "INVALID_CATEGORY"
  }
}
```

## Testing Strategy

### Unit Tests
- Category model validation
- Slug generation logic
- Category service methods
- Document-category association

### Integration Tests
- Category CRUD operations
- Document creation with category
- Category deletion with documents
- Category filtering and search
- Migration script

### Test Data
```javascript
const testCategories = [
  { name: 'People', icon: '👤' },
  { name: 'Nature', icon: '🌿' },
  { name: 'Architecture', icon: '🏛️' },
  { name: 'Abstract', icon: '🎨' },
  { name: 'Animals', icon: '🐾' }
];
```

## Performance Considerations

### Indexes
```javascript
// Category indexes
{ slug: 1 }                    // For slug lookups
{ status: 1 }                  // For filtering
{ displayOrder: 1, name: 1 }   // For sorting

// Document indexes (updated)
{ category: 1, status: 1 }     // For category filtering
{ category: 1, createdAt: -1 } // For category documents
```

### Caching Strategy
- Cache category list (5-minute TTL)
- Cache category statistics (10-minute TTL)
- Invalidate cache on category updates

### Query Optimization
- Use lean() for read-only queries
- Populate only necessary category fields
- Implement pagination for category documents

## Security Considerations

- Validate category IDs to prevent injection
- Sanitize category names and descriptions
- Prevent deletion of default category
- Validate category status before assignment
- Rate limit category creation

## Swagger Documentation Updates

### Category Schema
```yaml
Category:
  type: object
  required:
    - name
  properties:
    _id:
      type: string
    name:
      type: string
      maxLength: 100
    slug:
      type: string
    description:
      type: string
      maxLength: 500
    icon:
      type: string
    status:
      type: string
      enum: [active, inactive]
    displayOrder:
      type: integer
    documentCount:
      type: integer
    isDefault:
      type: boolean
    createdAt:
      type: string
      format: date-time
    updatedAt:
      type: string
      format: date-time
```

### Updated Document Schema
```yaml
Document:
  type: object
  required:
    - title
    - description
    - category
  properties:
    # ... existing fields
    category:
      oneOf:
        - type: string
          description: Category ID
        - $ref: '#/components/schemas/Category'
```
