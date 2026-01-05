const mongoose = require('mongoose');

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

// Indexes for performance optimization
documentSchema.index({ status: 1 });
documentSchema.index({ createdAt: -1 });
documentSchema.index({ category: 1 });
documentSchema.index({ category: 1, status: 1 });
documentSchema.index({ category: 1, createdAt: -1 });

// Schema method: Get maximum order value from images array
documentSchema.methods.getMaxImageOrder = function() {
  if (!this.images || this.images.length === 0) {
    return 0;
  }
  return Math.max(...this.images.map(img => img.order));
};

// Schema method: Add image with automatic order assignment
documentSchema.methods.addImage = function(cloudinaryId, url) {
  const newOrder = this.getMaxImageOrder() + 1;
  this.images.push({
    cloudinaryId,
    url,
    order: newOrder
  });
  return newOrder;
};

// Schema method: Remove image and reorder remaining images
documentSchema.methods.removeImage = function(imageId) {
  const imageIndex = this.images.findIndex(img => img._id.toString() === imageId);
  
  if (imageIndex === -1) {
    return null;
  }
  
  const removedImage = this.images[imageIndex];
  this.images.splice(imageIndex, 1);
  
  // Reorder remaining images to maintain sequential order
  this.reorderImagesSequentially();
  
  return removedImage;
};

// Schema method: Reorder images sequentially (1, 2, 3, ...)
documentSchema.methods.reorderImagesSequentially = function() {
  this.images.sort((a, b) => a.order - b.order);
  this.images.forEach((img, index) => {
    img.order = index + 1;
  });
};

// Schema method: Update image orders with custom values
documentSchema.methods.updateImageOrders = function(imageOrders) {
  const orderMap = new Map(imageOrders.map(item => [item.imageId, item.order]));
  
  this.images.forEach(img => {
    if (orderMap.has(img._id.toString())) {
      img.order = orderMap.get(img._id.toString());
    }
  });
  
  // Sort images by new order
  this.images.sort((a, b) => a.order - b.order);
};

// Schema method: Get images sorted by order
documentSchema.methods.getOrderedImages = function() {
  return [...this.images].sort((a, b) => a.order - b.order);
};

// Schema method: Set main image
documentSchema.methods.setMainImage = function(cloudinaryId, url) {
  this.main_image = {
    cloudinaryId,
    url
  };
};

// Schema method: Remove main image
documentSchema.methods.removeMainImage = function() {
  const oldMainImage = this.main_image;
  this.main_image = {
    cloudinaryId: null,
    url: null
  };
  return oldMainImage;
};

// Schema method: Check if main image exists
documentSchema.methods.hasMainImage = function() {
  return this.main_image && this.main_image.cloudinaryId && this.main_image.url;
};

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
