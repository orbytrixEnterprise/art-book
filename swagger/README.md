# Swagger API Documentation

This directory contains the OpenAPI 3.0 specification for the Drawing Document API, organized in a modular structure for maintainability.

## Structure

```
swagger/
├── swagger.config.js          # Main Swagger configuration and setup
├── schemas/                   # Data model definitions
│   ├── document.schema.js     # Document model schemas
│   └── image.schema.js        # Image model schemas
├── paths/                     # API endpoint definitions
│   ├── documents.paths.js     # Document CRUD endpoints
│   └── images.paths.js        # Image management endpoints
└── components/                # Reusable components
    ├── parameters.js          # Path and query parameters
    ├── requestBodies.js       # Request body definitions
    └── responses.js           # Response definitions
```

## Accessing the Documentation

Once the server is running, access the interactive Swagger UI at:

```
http://localhost:3000/api-docs
```

## Features

- **Interactive API Testing**: Test all endpoints directly from the browser
- **Comprehensive Schemas**: Detailed request/response models with validation rules
- **Example Requests**: Pre-filled examples for all endpoints
- **Error Documentation**: Complete error response formats
- **File Upload Support**: Test image upload endpoints with actual files

## Modular Organization

### Schemas
Define data models used throughout the API:
- `Document`: Main document entity with title, description, status, and images
- `ImageEntity`: Image reference with Cloudinary details and ordering
- Request/Response DTOs for all operations

### Paths
Document all API endpoints with:
- HTTP methods and URLs
- Request parameters and bodies
- Response codes and schemas
- Detailed descriptions and examples

### Components
Reusable definitions for:
- **Parameters**: Path parameters (documentId, imageId) and query parameters (status filter)
- **Request Bodies**: JSON and multipart/form-data request formats
- **Responses**: Standard success and error response formats

## Adding New Endpoints

To document a new endpoint:

1. Add the schema definition in `schemas/` if needed
2. Add the path definition in `paths/`
3. Reference existing components or create new ones in `components/`
4. The swagger.config.js will automatically pick up the changes

## Validation Rules

All schemas include validation rules matching the API implementation:
- String length limits (title: 200 chars, description: 2000 chars)
- Enum values (status: active/deactive)
- Required fields
- File upload constraints (max 10MB, 20 files for bulk)
- Supported image formats (jpeg, jpg, png, gif, webp)

## Testing with Swagger UI

1. Navigate to http://localhost:3000/api-docs
2. Expand any endpoint section
3. Click "Try it out"
4. Fill in required parameters
5. Click "Execute" to send the request
6. View the response with status code and body

## Environment Configuration

The Swagger configuration supports multiple server environments:
- Development: http://localhost:3000
- Production: https://api.example.com (update in swagger.config.js)

Update the `servers` array in `swagger.config.js` to match your deployment URLs.
