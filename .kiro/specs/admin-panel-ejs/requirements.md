# Requirements Document

## Introduction

This document outlines the requirements for a comprehensive admin panel built with EJS (Embedded JavaScript Templates) for the Drawing Document API. The admin panel will provide a user-friendly interface for managing documents, images, and all related operations without requiring direct API calls.

## Glossary

- **Admin Panel**: Web-based user interface for managing the drawing document system
- **EJS**: Embedded JavaScript templating engine for generating HTML markup
- **Category**: A classification group for organizing documents by type or theme (e.g., People, Nature, Architecture)
- **Document**: A drawing project entity containing title, description, category, status, main image, and gallery images
- **Main Image**: The primary cover image for a document
- **Gallery Images**: Collection of ordered images associated with a document
- **Dashboard**: The main landing page showing system overview and statistics
- **CRUD**: Create, Read, Update, Delete operations
- **Flash Messages**: Temporary notification messages shown to users after actions
- **Image Preview**: Visual representation of uploaded images before saving
- **Drag-and-Drop**: User interface pattern for reordering images or categories by dragging
- **Responsive Design**: Layout that adapts to different screen sizes
- **Pagination**: Dividing large lists into multiple pages
- **Category Slug**: URL-friendly version of category name

## Requirements

### Requirement 1: Admin Panel Authentication and Access

**User Story:** As an administrator, I want to access a secure admin panel, so that I can manage the drawing document system through a web interface.

#### Acceptance Criteria

1. WHEN the administrator navigates to "/admin", THE Admin Panel SHALL display a login page
2. WHEN valid credentials are entered, THE Admin Panel SHALL grant access to the dashboard
3. WHEN invalid credentials are entered, THE Admin Panel SHALL display an error message and remain on the login page
4. WHILE the administrator is logged in, THE Admin Panel SHALL display a logout option in the navigation
5. WHEN the administrator logs out, THE Admin Panel SHALL clear the session and redirect to the login page

### Requirement 2: Dashboard Overview

**User Story:** As an administrator, I want to see an overview dashboard, so that I can quickly understand the system status and key metrics.

#### Acceptance Criteria

1. WHEN the administrator accesses the dashboard, THE Admin Panel SHALL display the total count of documents
2. WHEN the administrator accesses the dashboard, THE Admin Panel SHALL display the count of active documents
3. WHEN the administrator accesses the dashboard, THE Admin Panel SHALL display the count of inactive documents
4. WHEN the administrator accesses the dashboard, THE Admin Panel SHALL display the total count of images across all documents
5. WHEN the administrator accesses the dashboard, THE Admin Panel SHALL display recent documents with thumbnails
6. WHEN the administrator clicks on a recent document, THE Admin Panel SHALL navigate to the document detail page
7. WHEN the administrator accesses the dashboard, THE Admin Panel SHALL display the total count of categories
8. WHEN the administrator accesses the dashboard, THE Admin Panel SHALL display the most popular categories by document count

### Requirement 3: Category Management

**User Story:** As an administrator, I want to manage categories through the admin panel, so that I can organize documents into logical groups.

#### Acceptance Criteria

1. WHEN the administrator navigates to the categories page, THE Admin Panel SHALL display all categories with their icons, document counts, and status
2. WHEN the administrator clicks "Create Category", THE Admin Panel SHALL display a category creation form
3. WHEN the administrator creates a category, THE Admin Panel SHALL validate the name is unique and does not exceed 100 characters
4. WHEN the administrator creates a category, THE Admin Panel SHALL allow selection of an icon or emoji
5. WHEN the administrator saves a new category, THE Admin Panel SHALL create the category and display a success message
6. WHEN the administrator clicks "Edit Category", THE Admin Panel SHALL display a pre-filled form with current category data
7. WHEN the administrator updates a category, THE Admin Panel SHALL validate the new name is unique
8. WHEN the administrator clicks "Delete Category", THE Admin Panel SHALL check if documents are assigned to it
9. IF documents are assigned to a category, THEN THE Admin Panel SHALL prevent deletion and display an error message with document count
10. WHEN a category has no documents, THE Admin Panel SHALL allow deletion after confirmation
11. WHEN the administrator views categories, THE Admin Panel SHALL display them in order with drag-and-drop reordering capability
12. WHEN the administrator reorders categories, THE Admin Panel SHALL save the new order and update the display
13. WHEN the administrator filters categories by status, THE Admin Panel SHALL display only matching categories
14. WHEN the administrator clicks on a category, THE Admin Panel SHALL display all documents in that category

### Requirement 4: Document List Management

**User Story:** As an administrator, I want to view and manage all documents in a list, so that I can easily browse and perform actions on multiple documents.

#### Acceptance Criteria

1. WHEN the administrator navigates to the documents list, THE Admin Panel SHALL display all documents in a table or card layout
2. WHEN the administrator views the documents list, THE Admin Panel SHALL show document title, main image thumbnail, status, and image count for each document
3. WHEN the administrator clicks a filter option, THE Admin Panel SHALL display only documents matching the selected status
4. WHEN the administrator enters text in the search box, THE Admin Panel SHALL filter documents by title or description
5. WHEN the documents list exceeds 20 items, THE Admin Panel SHALL paginate the results
6. WHEN the administrator clicks on a document, THE Admin Panel SHALL navigate to the document detail page
7. WHEN the administrator clicks the delete button, THE Admin Panel SHALL display a confirmation dialog before deletion
8. WHEN the administrator confirms deletion, THE Admin Panel SHALL delete the document and refresh the list

### Requirement 4: Document List Management

**User Story:** As an administrator, I want to view and manage all documents in a list, so that I can easily browse and perform actions on multiple documents.

#### Acceptance Criteria

1. WHEN the administrator navigates to the documents list, THE Admin Panel SHALL display all documents in a table or card layout
2. WHEN the administrator views the documents list, THE Admin Panel SHALL show document title, category, main image thumbnail, status, and image count for each document
3. WHEN the administrator clicks a category filter, THE Admin Panel SHALL display only documents in that category
4. WHEN the administrator clicks a status filter, THE Admin Panel SHALL display only documents matching the selected status
5. WHEN the administrator enters text in the search box, THE Admin Panel SHALL filter documents by title or description
6. WHEN the documents list exceeds 20 items, THE Admin Panel SHALL paginate the results
7. WHEN the administrator clicks on a document, THE Admin Panel SHALL navigate to the document detail page
8. WHEN the administrator clicks the delete button, THE Admin Panel SHALL display a confirmation dialog before deletion
9. WHEN the administrator confirms deletion, THE Admin Panel SHALL delete the document and refresh the list

### Requirement 5: Document Creation

**User Story:** As an administrator, I want to create new documents through a form, so that I can add drawing projects to the system easily.

#### Acceptance Criteria

1. WHEN the administrator clicks "Create Document", THE Admin Panel SHALL display a document creation form
2. WHEN the administrator views the creation form, THE Admin Panel SHALL display a category dropdown with all active categories
3. WHEN the administrator enters a title, THE Admin Panel SHALL validate that the title does not exceed 200 characters
4. WHEN the administrator enters a description, THE Admin Panel SHALL validate that the description does not exceed 2000 characters
5. WHEN the administrator selects a category, THE Admin Panel SHALL require a category selection before submission
6. WHEN the administrator selects a status, THE Admin Panel SHALL accept only "active" or "deactive" values
7. WHEN the administrator uploads a main image, THE Admin Panel SHALL display a preview of the selected image
8. WHEN the administrator submits the form with valid data, THE Admin Panel SHALL create the document and redirect to the document detail page
9. WHEN the administrator submits the form without selecting a category, THE Admin Panel SHALL display a validation error
10. WHEN the administrator submits the form with invalid data, THE Admin Panel SHALL display validation error messages
11. WHEN the administrator clicks cancel, THE Admin Panel SHALL return to the documents list without saving

### Requirement 6: Document Editing

**User Story:** As an administrator, I want to edit existing documents, so that I can update document information and correct mistakes.

#### Acceptance Criteria

1. WHEN the administrator clicks "Edit Document", THE Admin Panel SHALL display a pre-filled form with current document data
2. WHEN the administrator views the edit form, THE Admin Panel SHALL display the current category selected in the dropdown
3. WHEN the administrator modifies the title, THE Admin Panel SHALL validate the new title length
4. WHEN the administrator modifies the description, THE Admin Panel SHALL validate the new description length
5. WHEN the administrator changes the category, THE Admin Panel SHALL allow selection of any active category
6. WHEN the administrator changes the status, THE Admin Panel SHALL update the document status
7. WHEN the administrator uploads a new main image, THE Admin Panel SHALL display a preview and replace the existing main image
8. WHEN the administrator clicks "Remove Main Image", THE Admin Panel SHALL delete the main image from the document
9. WHEN the administrator saves changes, THE Admin Panel SHALL update the document and display a success message
10. WHEN validation fails, THE Admin Panel SHALL display error messages without losing entered data

### Requirement 7: Main Image Management

**User Story:** As an administrator, I want to manage the main image for each document, so that I can set an appropriate cover image for the drawing project.

#### Acceptance Criteria

1. WHEN the administrator views a document without a main image, THE Admin Panel SHALL display a placeholder image
2. WHEN the administrator uploads a main image, THE Admin Panel SHALL validate the file type is jpeg, jpg, png, gif, or webp
3. WHEN the administrator uploads a main image, THE Admin Panel SHALL validate the file size does not exceed 10MB
4. WHEN the administrator uploads a valid main image, THE Admin Panel SHALL display a preview before saving
5. WHEN the administrator saves a new main image, THE Admin Panel SHALL upload to Cloudinary and update the document
6. WHEN the administrator clicks "Remove Main Image", THE Admin Panel SHALL display a confirmation dialog
7. WHEN the administrator confirms removal, THE Admin Panel SHALL delete the image from Cloudinary and update the document

### Requirement 7: Gallery Images Management

**User Story:** As an administrator, I want to manage gallery images for each document, so that I can maintain a collection of related drawings.

#### Acceptance Criteria

1. WHEN the administrator views a document, THE Admin Panel SHALL display all gallery images in order
2. WHEN the administrator uploads a single image, THE Admin Panel SHALL add it to the gallery with the next order number
3. WHEN the administrator uploads multiple images, THE Admin Panel SHALL display upload progress for each file
4. WHEN the administrator uploads multiple images, THE Admin Panel SHALL add all successful uploads to the gallery
5. WHEN image upload fails, THE Admin Panel SHALL display error messages for failed uploads without affecting successful ones
6. WHEN the administrator views gallery images, THE Admin Panel SHALL display each image with its order number
7. WHEN the administrator clicks on a gallery image, THE Admin Panel SHALL display a larger preview in a modal
8. WHEN the administrator clicks delete on a gallery image, THE Admin Panel SHALL display a confirmation dialog

### Requirement 8: Image Reordering

**User Story:** As an administrator, I want to reorder gallery images using drag-and-drop, so that I can arrange images in the desired sequence.

#### Acceptance Criteria

1. WHEN the administrator views gallery images, THE Admin Panel SHALL enable drag-and-drop functionality
2. WHEN the administrator drags an image, THE Admin Panel SHALL provide visual feedback during the drag operation
3. WHEN the administrator drops an image in a new position, THE Admin Panel SHALL update the visual order immediately
4. WHEN the administrator clicks "Save Order", THE Admin Panel SHALL persist the new order to the database
5. WHEN the administrator clicks "Cancel", THE Admin Panel SHALL revert to the original order
6. WHEN reordering fails, THE Admin Panel SHALL display an error message and revert to the previous order

### Requirement 9: Bulk Image Operations

**User Story:** As an administrator, I want to perform bulk operations on gallery images, so that I can efficiently manage multiple images at once.

#### Acceptance Criteria

1. WHEN the administrator views gallery images, THE Admin Panel SHALL display checkboxes for selecting multiple images
2. WHEN the administrator selects multiple images, THE Admin Panel SHALL display bulk action buttons
3. WHEN the administrator clicks "Delete Selected", THE Admin Panel SHALL display a confirmation dialog with the count of selected images
4. WHEN the administrator confirms bulk deletion, THE Admin Panel SHALL delete all selected images and display a success message
5. WHEN bulk deletion fails for some images, THE Admin Panel SHALL display which images failed and which succeeded

### Requirement 10: Image Preview and Lightbox

**User Story:** As an administrator, I want to view images in full size, so that I can inspect image quality and details.

#### Acceptance Criteria

1. WHEN the administrator clicks on any image thumbnail, THE Admin Panel SHALL display the image in a lightbox modal
2. WHEN the lightbox is open, THE Admin Panel SHALL display the full-size image
3. WHEN the lightbox is open for a gallery image, THE Admin Panel SHALL display navigation arrows to view adjacent images
4. WHEN the administrator clicks the next arrow, THE Admin Panel SHALL display the next image in the gallery
5. WHEN the administrator clicks the previous arrow, THE Admin Panel SHALL display the previous image in the gallery
6. WHEN the administrator clicks outside the image or presses escape, THE Admin Panel SHALL close the lightbox
7. WHEN the lightbox displays an image, THE Admin Panel SHALL show the image order number and filename

### Requirement 11: Responsive Design

**User Story:** As an administrator, I want the admin panel to work on different devices, so that I can manage documents from desktop, tablet, or mobile.

#### Acceptance Criteria

1. WHEN the administrator accesses the admin panel on a desktop, THE Admin Panel SHALL display a multi-column layout
2. WHEN the administrator accesses the admin panel on a tablet, THE Admin Panel SHALL adjust the layout to fit the screen width
3. WHEN the administrator accesses the admin panel on a mobile device, THE Admin Panel SHALL display a single-column layout with a hamburger menu
4. WHEN the screen width is below 768 pixels, THE Admin Panel SHALL stack form fields vertically
5. WHEN the screen width is below 768 pixels, THE Admin Panel SHALL make tables horizontally scrollable

### Requirement 12: User Feedback and Notifications

**User Story:** As an administrator, I want to receive clear feedback for my actions, so that I know whether operations succeeded or failed.

#### Acceptance Criteria

1. WHEN the administrator completes a successful action, THE Admin Panel SHALL display a success message
2. WHEN an operation fails, THE Admin Panel SHALL display an error message with details
3. WHEN the administrator performs a destructive action, THE Admin Panel SHALL display a confirmation dialog
4. WHEN the administrator uploads files, THE Admin Panel SHALL display upload progress indicators
5. WHEN the administrator saves changes, THE Admin Panel SHALL display a loading indicator during the save operation
6. WHEN messages are displayed, THE Admin Panel SHALL automatically dismiss them after 5 seconds
7. WHEN the administrator clicks the close button on a message, THE Admin Panel SHALL immediately dismiss the message

### Requirement 13: Form Validation

**User Story:** As an administrator, I want real-time form validation, so that I can correct errors before submitting.

#### Acceptance Criteria

1. WHEN the administrator enters data in a required field, THE Admin Panel SHALL remove the error indicator when valid data is entered
2. WHEN the administrator leaves a required field empty, THE Admin Panel SHALL display a "required field" error message
3. WHEN the administrator exceeds character limits, THE Admin Panel SHALL display a character count and error message
4. WHEN the administrator selects an invalid file type, THE Admin Panel SHALL display an error message immediately
5. WHEN the administrator selects a file exceeding size limits, THE Admin Panel SHALL display an error message with the maximum allowed size
6. WHEN all form fields are valid, THE Admin Panel SHALL enable the submit button
7. WHEN any form field is invalid, THE Admin Panel SHALL disable the submit button

### Requirement 14: Search and Filter

**User Story:** As an administrator, I want to search and filter documents, so that I can quickly find specific documents.

#### Acceptance Criteria

1. WHEN the administrator enters text in the search box, THE Admin Panel SHALL filter documents in real-time
2. WHEN the administrator selects a status filter, THE Admin Panel SHALL display only documents with the selected status
3. WHEN the administrator applies multiple filters, THE Admin Panel SHALL combine all filter criteria
4. WHEN the administrator clears filters, THE Admin Panel SHALL display all documents
5. WHEN no documents match the search criteria, THE Admin Panel SHALL display a "no results found" message

### Requirement 15: Error Handling

**User Story:** As an administrator, I want graceful error handling, so that I understand what went wrong and can take corrective action.

#### Acceptance Criteria

1. WHEN a network error occurs, THE Admin Panel SHALL display a user-friendly error message
2. WHEN the API returns a 404 error, THE Admin Panel SHALL display a "not found" message
3. WHEN the API returns a 400 error, THE Admin Panel SHALL display validation error details
4. WHEN the API returns a 500 error, THE Admin Panel SHALL display a "server error" message and suggest retrying
5. WHEN Cloudinary upload fails, THE Admin Panel SHALL display the specific error and allow retry
6. WHEN the session expires, THE Admin Panel SHALL redirect to the login page with a session expired message
