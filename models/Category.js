const mongoose = require('mongoose');

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
    default: '📁',
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
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
    .replace(/[^\w\s-]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/-+/g, '-')        // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '');   // Remove leading/trailing hyphens
  
  return slug || 'category';
};

// Pre-save hook to generate slug
categorySchema.pre('save', async function(next) {
  if (this.isModified('name') || !this.slug) {
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

// Static method to get next display order
categorySchema.statics.getNextDisplayOrder = async function() {
  const lastCategory = await this.findOne().sort({ displayOrder: -1 });
  return lastCategory ? lastCategory.displayOrder + 1 : 1;
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
