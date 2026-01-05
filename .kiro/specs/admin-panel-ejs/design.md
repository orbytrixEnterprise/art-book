# Design Document

## Overview

The Admin Panel is a server-side rendered web application built with EJS (Embedded JavaScript Templates) that provides a comprehensive interface for managing the Drawing Document API. The panel follows a traditional MVC architecture with Express.js handling routing, EJS rendering views, and the existing API services managing business logic.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  HTML/CSS    │  │  JavaScript  │  │   Images     │  │
│  │  (EJS Views) │  │  (Client-side)│  │  (Cloudinary)│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Express.js Server                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Admin Routes Layer                   │  │
│  │  /admin/login, /admin/dashboard, /admin/documents│  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Admin Controllers Layer                │  │
│  │  Authentication, Dashboard, Document Management  │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │              EJS View Engine                      │  │
│  │  Renders HTML from templates + data              │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Existing Service Layer                  │  │
│  │  DocumentService, CloudinaryService              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    MongoDB Database                      │
│              Documents Collection                        │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Template Engine**: EJS (Embedded JavaScript)
- **CSS Framework**: Bootstrap 5 (responsive, modern UI)
- **JavaScript**: Vanilla JS with modern ES6+ features
- **File Upload**: Multer (already integrated)
- **Session Management**: express-session with connect-mongo
- **Flash Messages**: connect-flash
- **Authentication**: Simple session-based auth (can be enhanced later)
- **Icons**: Bootstrap Icons
- **Image Handling**: Existing Cloudinary integration

## Components and Interfaces

### 1. Directory Structure

```
views/
├── admin/
│   ├── layouts/
│   │   ├── main.ejs              # Main layout with header, nav, footer
│   │   └── auth.ejs              # Authentication layout (login)
│   ├── partials/
│   │   ├── header.ejs            # Navigation bar
│   │   ├── footer.ejs            # Footer
│   │   ├── flash.ejs             # Flash message component
│   │   ├── pagination.ejs        # Pagination component
│   │   └── image-preview.ejs     # Image preview modal
│   ├── auth/
│   │   └── login.ejs             # Login page
│   ├── dashboard/
│   │   └── index.ejs             # Dashboard overview
│   ├── documents/
│   │   ├── index.ejs             # Document list
│   │   ├── create.ejs            # Create document form
│   │   ├── edit.ejs              # Edit document form
│   │   └── view.ejs              # Document detail view
│   └── errors/
│       ├── 404.ejs               # Not found page
│       └── 500.ejs               # Server error page
├── public/
│   ├── css/
│   │   ├── admin.css             # Custom admin styles
│   │   └── bootstrap.min.css     # Bootstrap CSS
│   ├── js/
│   │   ├── admin.js              # Main admin JavaScript
│   │   ├── image-upload.js       # Image upload handling
│   │   ├── drag-drop.js          # Drag and drop for reordering
│   │   └── form-validation.js    # Client-side validation
│   └── images/
│       └── placeholder.png       # Placeholder for missing images
```

### 2. Route Structure

```javascript
// Admin Routes
/admin                          → Redirect to /admin/dashboard
/admin/login                    → GET: Login page, POST: Authenticate
/admin/logout                   → POST: Logout and clear session
/admin/dashboard                → GET: Dashboard overview

// Document Routes
/admin/documents                → GET: List all documents (with filters)
/admin/documents/create         → GET: Create form, POST: Create document
/admin/documents/:id            → GET: View document details
/admin/documents/:id/edit       → GET: Edit form, POST: Update document
/admin/documents/:id/delete     → POST: Delete document

// Main Image Routes
/admin/documents/:id/main-image/upload   → POST: Upload main image
/admin/documents/:id/main-image/delete   → POST: Delete main image

// Gallery Image Routes
/admin/documents/:id/images/upload       → POST: Upload single image
/admin/documents/:id/images/bulk-upload  → POST: Upload multiple images
/admin/documents/:id/images/reorder      → POST: Reorder images
/admin/documents/:id/images/:imageId/delete → POST: Delete single image
/admin/documents/:id/images/bulk-delete  → POST: Delete multiple images
```

### 3. Controller Architecture

#### AdminAuthController
```javascript
class AdminAuthController {
  // GET /admin/login
  showLoginPage(req, res)
  
  // POST /admin/login
  login(req, res)
  
  // POST /admin/logout
  logout(req, res)
}
```

#### AdminDashboardController
```javascript
class AdminDashboardController {
  // GET /admin/dashboard
  async showDashboard(req, res) {
    // Fetch statistics
    // - Total documents
    // - Active/Inactive counts
    // - Total images
    // - Recent documents
    // Render dashboard view
  }
}
```

#### AdminDocumentController
```javascript
class AdminDocumentController {
  // GET /admin/documents
  async listDocuments(req, res) {
    // Parse query params (status, search, page)
    // Fetch documents with pagination
    // Render documents list
  }
  
  // GET /admin/documents/create
  showCreateForm(req, res)
  
  // POST /admin/documents/create
  async createDocument(req, res) {
    // Validate input
    // Create document via service
    // Handle main image upload if provided
    // Redirect to document view
  }
  
  // GET /admin/documents/:id
  async viewDocument(req, res) {
    // Fetch document by ID
    // Render document detail view
  }
  
  // GET /admin/documents/:id/edit
  async showEditForm(req, res) {
    // Fetch document by ID
    // Render edit form with pre-filled data
  }
  
  // POST /admin/documents/:id/edit
  async updateDocument(req, res) {
    // Validate input
    // Update document via service
    // Redirect to document view
  }
  
  // POST /admin/documents/:id/delete
  async deleteDocument(req, res) {
    // Delete document via service
    // Redirect to documents list
  }
}
```

#### AdminImageController
```javascript
class AdminImageController {
  // POST /admin/documents/:id/main-image/upload
  async uploadMainImage(req, res) {
    // Use existing documentService.addMainImage
    // Return JSON response for AJAX
  }
  
  // POST /admin/documents/:id/main-image/delete
  async deleteMainImage(req, res) {
    // Use existing documentService.removeMainImage
    // Return JSON response for AJAX
  }
  
  // POST /admin/documents/:id/images/upload
  async uploadSingleImage(req, res) {
    // Use existing imageService.uploadSingleImage
    // Return JSON response for AJAX
  }
  
  // POST /admin/documents/:id/images/bulk-upload
  async uploadBulkImages(req, res) {
    // Use existing imageService.uploadBulkImages
    // Return JSON response with progress
  }
  
  // POST /admin/documents/:id/images/reorder
  async reorderImages(req, res) {
    // Use existing imageService.reorderImages
    // Return JSON response for AJAX
  }
  
  // POST /admin/documents/:id/images/:imageId/delete
  async deleteSingleImage(req, res) {
    // Use existing imageService.removeImage
    // Return JSON response for AJAX
  }
  
  // POST /admin/documents/:id/images/bulk-delete
  async deleteBulkImages(req, res) {
    // Use existing imageService.removeMultipleImages
    // Return JSON response for AJAX
  }
}
```

### 4. Middleware Stack

#### Authentication Middleware
```javascript
function requireAuth(req, res, next) {
  if (!req.session.isAuthenticated) {
    req.flash('error', 'Please login to access the admin panel');
    return res.redirect('/admin/login');
  }
  next();
}
```

#### Flash Message Middleware
```javascript
function setupFlashMessages(req, res, next) {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.info = req.flash('info');
  next();
}
```

#### View Helpers Middleware
```javascript
function setupViewHelpers(req, res, next) {
  res.locals.currentUser = req.session.user;
  res.locals.currentPath = req.path;
  res.locals.formatDate = (date) => { /* format date */ };
  res.locals.truncate = (text, length) => { /* truncate text */ };
  next();
}
```

## Data Models

### Session Data
```javascript
{
  isAuthenticated: Boolean,
  user: {
    username: String,
    loginTime: Date
  }
}
```

### View Data Structures

#### Dashboard Data
```javascript
{
  stats: {
    totalDocuments: Number,
    activeDocuments: Number,
    inactiveDocuments: Number,
    totalImages: Number
  },
  recentDocuments: [
    {
      _id: String,
      title: String,
      main_image: { url: String },
      images: Array,
      status: String,
      createdAt: Date
    }
  ]
}
```

#### Document List Data
```javascript
{
  documents: [
    {
      _id: String,
      title: String,
      description: String,
      status: String,
      main_image: { url: String },
      images: Array,
      createdAt: Date,
      updatedAt: Date
    }
  ],
  pagination: {
    currentPage: Number,
    totalPages: Number,
    totalDocuments: Number,
    hasNextPage: Boolean,
    hasPrevPage: Boolean
  },
  filters: {
    status: String,
    search: String
  }
}
```

## User Interface Design

### Layout Components

#### Main Layout (main.ejs)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title %> - Admin Panel</title>
  <link rel="stylesheet" href="/css/bootstrap.min.css">
  <link rel="stylesheet" href="/css/admin.css">
</head>
<body>
  <%- include('../partials/header') %>
  
  <div class="container-fluid">
    <div class="row">
      <!-- Sidebar Navigation -->
      <nav class="col-md-2 d-md-block bg-light sidebar">
        <!-- Navigation links -->
      </nav>
      
      <!-- Main Content -->
      <main class="col-md-10 ms-sm-auto px-md-4">
        <%- include('../partials/flash') %>
        <%- body %>
      </main>
    </div>
  </div>
  
  <%- include('../partials/footer') %>
  
  <script src="/js/bootstrap.bundle.min.js"></script>
  <script src="/js/admin.js"></script>
</body>
</html>
```

#### Navigation Sidebar
- Dashboard (icon + label)
- Documents (icon + label)
  - All Documents
  - Create New
  - Active Documents
  - Inactive Documents
- Logout (icon + label)

### Page Designs

#### Dashboard Page
- **Header**: "Dashboard" with date/time
- **Statistics Cards** (4 cards in a row):
  - Total Documents (with icon)
  - Active Documents (green badge)
  - Inactive Documents (gray badge)
  - Total Images (with icon)
- **Recent Documents Section**:
  - Card grid (3-4 per row)
  - Each card shows: thumbnail, title, status badge, image count
  - Click to view details

#### Documents List Page
- **Header**: "Documents" with "Create New" button
- **Filters Bar**:
  - Search input (real-time search)
  - Status dropdown (All, Active, Inactive)
  - Clear filters button
- **Documents Table/Grid**:
  - Thumbnail | Title | Description | Status | Images | Actions
  - Actions: View, Edit, Delete
- **Pagination**: Previous, page numbers, Next

#### Create/Edit Document Form
- **Form Fields**:
  - Title (text input, character counter)
  - Description (textarea, character counter)
  - Status (radio buttons: Active/Inactive)
  - Main Image (file upload with preview)
  - Submit and Cancel buttons
- **Validation**: Real-time validation with error messages

#### Document Detail Page
- **Document Info Section**:
  - Title (large heading)
  - Description
  - Status badge
  - Created/Updated dates
  - Edit and Delete buttons
- **Main Image Section**:
  - Large main image display or placeholder
  - Upload/Replace button
  - Remove button (if image exists)
- **Gallery Images Section**:
  - Grid of image thumbnails (4-6 per row)
  - Each thumbnail shows order number
  - Drag-and-drop enabled for reordering
  - Checkbox for bulk selection
  - Upload single/multiple buttons
  - Delete selected button
  - Save order button (appears after reordering)

## Error Handling

### Client-Side Error Handling
- Form validation errors displayed inline
- AJAX errors shown as toast notifications
- Network errors with retry option
- File upload errors with specific messages

### Server-Side Error Handling
- Try-catch blocks in all async operations
- Flash messages for user-facing errors
- Error logging for debugging
- Graceful fallbacks for missing data

### Error Pages
- **404 Page**: "Document not found" with link to documents list
- **500 Page**: "Something went wrong" with link to dashboard
- **403 Page**: "Access denied" with link to login

## Testing Strategy

### Manual Testing Checklist
1. **Authentication**:
   - Login with valid credentials
   - Login with invalid credentials
   - Logout functionality
   - Session persistence

2. **Document CRUD**:
   - Create document with all fields
   - Create document with minimal fields
   - Edit document
   - Delete document
   - View document details

3. **Main Image**:
   - Upload main image
   - Replace main image
   - Remove main image
   - Invalid file type/size

4. **Gallery Images**:
   - Upload single image
   - Upload multiple images (bulk)
   - Reorder images (drag-and-drop)
   - Delete single image
   - Delete multiple images (bulk)
   - View image in lightbox

5. **Search and Filter**:
   - Search by title
   - Filter by status
   - Combined search and filter
   - Clear filters

6. **Responsive Design**:
   - Desktop view (1920x1080)
   - Tablet view (768x1024)
   - Mobile view (375x667)

7. **Error Scenarios**:
   - Network disconnection
   - Invalid document ID
   - File upload failures
   - Session expiration

### Browser Compatibility
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Security Considerations

### Authentication
- Session-based authentication
- Secure session cookies (httpOnly, secure in production)
- Session timeout after inactivity
- CSRF protection for forms

### File Upload Security
- File type validation (whitelist)
- File size limits enforced
- Sanitize filenames
- Use existing Cloudinary security features

### Input Validation
- Server-side validation for all inputs
- XSS prevention (EJS auto-escapes by default)
- SQL injection prevention (Mongoose handles this)
- Character limits enforced

### Access Control
- All admin routes require authentication
- No direct access to admin pages without login
- Logout clears session completely

## Performance Optimization

### Server-Side
- Pagination for large document lists (20 per page)
- Efficient database queries with indexes
- Caching for dashboard statistics (5-minute cache)
- Lazy loading for images

### Client-Side
- Minified CSS and JavaScript in production
- Image thumbnails for list views
- Debounced search input
- Progressive image loading
- Optimized Cloudinary image delivery

### Asset Delivery
- CDN for Bootstrap and icons
- Compressed images
- Browser caching headers
- Gzip compression

## Deployment Considerations

### Environment Variables
```
# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=hashed_password

# Session Secret
SESSION_SECRET=random_secret_key

# Session Store
MONGODB_SESSION_URI=mongodb://localhost:27017/admin-sessions

# Environment
NODE_ENV=production
```

### Production Checklist
- Enable HTTPS
- Set secure session cookies
- Enable CSRF protection
- Set proper CORS headers
- Enable rate limiting
- Set up error monitoring
- Configure logging
- Optimize asset delivery
- Set up backup strategy

## Future Enhancements

### Phase 2 Features
- User management (multiple admin users)
- Role-based access control
- Activity logs and audit trail
- Bulk document operations
- Export documents to PDF
- Image editing capabilities
- Advanced search with filters
- Document categories/tags
- API usage statistics
- Scheduled backups

### Phase 3 Features
- Real-time notifications
- Collaborative editing
- Version history for documents
- Advanced analytics dashboard
- Custom themes
- Mobile app integration
- Webhook management
- API key management
