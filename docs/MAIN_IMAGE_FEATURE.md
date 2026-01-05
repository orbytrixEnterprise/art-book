# Main Image Feature Documentation

## Overview

The main_image feature allows each document to have a dedicated main/cover image that is separate from the gallery images array. This provides a clear distinction between the primary visual representation of a document and its associated gallery images.

## Database Schema

### Document Model Updates

The Document model now includes a `main_image` field:

```javascript
main_image: {
  cloudinaryId: {
    type: String,
    default: null
  },
  url: {
    type: String,
    default: null
  }
}
```

### Model Methods

New methods added to the Document schema:

- `setMainImage(cloudinaryId, url)` - Sets the main image
- `removeMainImage()` - Removes the main image and returns the old value
- `hasMainImage()` - Checks if a main image exists

## API Endpoints

### 1. Add/Update Main Image

**POST** `/api/documents/:id/main-image`

Uploads a new main image or replaces an existing one. If a main image already exists, the old one is automatically deleted from Cloudinary.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `image` (file)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "My Drawing Project",
    "description": "A collection of architectural drawings",
    "status": "active",
    "main_image": {
      "cloudinaryId": "drawing-app/documents/main_abc123",
      "url": "https://res.cloudinary.com/demo/image/upload/..."
    },
    "images": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T14:45:00.000Z"
  }
}
```

### 2. Update Main Image

**PUT** `/api/documents/:id/main-image`

Replaces the existing main image with a new one. Functionally identical to POST.

**Request:**
- Method: PUT
- Content-Type: multipart/form-data
- Body: `image` (file)

**Response:** Same as POST

### 3. Remove Main Image

**DELETE** `/api/documents/:id/main-image`

Removes the main image from the document and deletes it from Cloudinary.

**Request:**
- Method: DELETE

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "My Drawing Project",
    "description": "A collection of architectural drawings",
    "status": "active",
    "main_image": {
      "cloudinaryId": null,
      "url": null
    },
    "images": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T14:45:00.000Z"
  }
}
```

## Error Handling

### 400 Bad Request
- No image file provided
- Invalid document ID format

### 404 Not Found
- Document not found
- Document does not have a main image (DELETE only)

### 500 Internal Server Error
- Cloudinary upload/deletion failures
- Database errors

## Implementation Details

### Service Layer

**DocumentService** methods:

1. `addMainImage(id, file)`
   - Retrieves the document
   - Deletes old main image from Cloudinary if exists
   - Uploads new image to Cloudinary
   - Updates document with new main image
   - Saves and returns updated document

2. `removeMainImage(id)`
   - Retrieves the document
   - Validates main image exists
   - Deletes image from Cloudinary
   - Removes main image from document
   - Saves and returns updated document

3. `updateMainImage(id, file)`
   - Alias for `addMainImage` (handles replacement automatically)

### Controller Layer

**DocumentController** methods:

- `addMainImage` - Handles POST requests
- `updateMainImage` - Handles PUT requests
- `removeMainImage` - Handles DELETE requests

All methods include:
- File validation
- Error handling for 400, 404, and 500 errors
- Consistent response format

### Middleware

Uses existing `uploadSingle` middleware from the image upload feature:
- Validates file type (jpeg, jpg, png, gif, webp)
- Enforces file size limit (10MB)
- Handles multipart/form-data parsing

## Cascading Deletion

When a document is deleted, both the main_image and all gallery images are deleted from Cloudinary:

```javascript
// Collects all image IDs (main + gallery)
const imagesToDelete = [];
if (document.main_image && document.main_image.cloudinaryId) {
  imagesToDelete.push(document.main_image.cloudinaryId);
}
if (document.images && document.images.length > 0) {
  imagesToDelete.push(...document.images.map(img => img.cloudinaryId));
}
// Bulk delete from Cloudinary
await cloudinaryService.deleteBulkImages(imagesToDelete);
```

## Swagger Documentation

The main_image feature is fully documented in Swagger:

- Schema definition in `swagger/schemas/document.schema.js`
- Endpoint documentation in `swagger/paths/documents.paths.js`
- Accessible at `/api-docs`

## Usage Examples

### Using cURL

**Add Main Image:**
```bash
curl -X POST http://localhost:3000/api/documents/507f1f77bcf86cd799439011/main-image \
  -F "image=@/path/to/image.jpg"
```

**Update Main Image:**
```bash
curl -X PUT http://localhost:3000/api/documents/507f1f77bcf86cd799439011/main-image \
  -F "image=@/path/to/new-image.jpg"
```

**Remove Main Image:**
```bash
curl -X DELETE http://localhost:3000/api/documents/507f1f77bcf86cd799439011/main-image
```

### Using JavaScript (Fetch API)

```javascript
// Add/Update Main Image
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch(`/api/documents/${documentId}/main-image`, {
  method: 'POST',
  body: formData
});

const result = await response.json();

// Remove Main Image
const response = await fetch(`/api/documents/${documentId}/main-image`, {
  method: 'DELETE'
});

const result = await response.json();
```

## Testing

To test the main_image feature:

1. Start the server: `npm start`
2. Create a document: `POST /api/documents`
3. Add a main image: `POST /api/documents/:id/main-image`
4. Verify the image appears in the document
5. Update the main image: `PUT /api/documents/:id/main-image`
6. Remove the main image: `DELETE /api/documents/:id/main-image`

## Notes

- The main_image is optional and can be null
- Replacing a main image automatically deletes the old one from Cloudinary
- Main image is separate from the gallery images array
- File size limit: 10MB
- Supported formats: jpeg, jpg, png, gif, webp
- Cloudinary deletion errors are logged but don't prevent document operations
