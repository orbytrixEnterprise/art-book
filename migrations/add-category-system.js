require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Document = require('../models/Document');

/**
 * Migration script to add category system to existing documents
 * This script is idempotent and safe to run multiple times
 */

async function migrateToCategories() {
  console.log('Starting category system migration...\n');
  
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB');
    
    // Step 1: Create or find default "Uncategorized" category
    console.log('\n[Step 1] Creating default category...');
    let defaultCategory = await Category.findOne({ isDefault: true });
    
    if (defaultCategory) {
      console.log(`✓ Default category already exists: "${defaultCategory.name}" (ID: ${defaultCategory._id})`);
    } else {
      // Check if "Uncategorized" exists but isn't marked as default
      defaultCategory = await Category.findOne({ name: 'Uncategorized' });
      
      if (defaultCategory) {
        // Mark existing "Uncategorized" as default
        defaultCategory.isDefault = true;
        await defaultCategory.save();
        console.log(`✓ Marked existing "Uncategorized" category as default (ID: ${defaultCategory._id})`);
      } else {
        // Create new default category
        defaultCategory = await Category.create({
          name: 'Uncategorized',
          slug: 'uncategorized',
          description: 'Documents without a specific category',
          icon: '📁',
          status: 'active',
          displayOrder: 999,
          isDefault: true
        });
        console.log(`✓ Created default category: "${defaultCategory.name}" (ID: ${defaultCategory._id})`);
      }
    }
    
    // Step 2: Update all existing documents without a category
    console.log('\n[Step 2] Updating documents without category...');
    
    // Count documents without category
    const documentsWithoutCategory = await Document.countDocuments({
      $or: [
        { category: { $exists: false } },
        { category: null }
      ]
    });
    
    if (documentsWithoutCategory === 0) {
      console.log('✓ All documents already have a category assigned');
    } else {
      console.log(`Found ${documentsWithoutCategory} document(s) without category`);
      
      // Update documents to reference default category
      const updateResult = await Document.updateMany(
        {
          $or: [
            { category: { $exists: false } },
            { category: null }
          ]
        },
        { $set: { category: defaultCategory._id } }
      );
      
      console.log(`✓ Updated ${updateResult.modifiedCount} document(s) to default category`);
    }
    
    // Step 3: Create indexes on category field
    console.log('\n[Step 3] Creating indexes on category field...');
    
    try {
      // Get existing indexes
      const existingIndexes = await Document.collection.getIndexes();
      const indexNames = Object.keys(existingIndexes);
      
      // Check and create category index
      if (!indexNames.some(name => name.includes('category_1'))) {
        await Document.collection.createIndex({ category: 1 });
        console.log('✓ Created index: { category: 1 }');
      } else {
        console.log('✓ Index { category: 1 } already exists');
      }
      
      // Check and create compound index: category + status
      if (!indexNames.some(name => name.includes('category_1_status_1'))) {
        await Document.collection.createIndex({ category: 1, status: 1 });
        console.log('✓ Created index: { category: 1, status: 1 }');
      } else {
        console.log('✓ Index { category: 1, status: 1 } already exists');
      }
      
      // Check and create compound index: category + createdAt
      if (!indexNames.some(name => name.includes('category_1_createdAt_-1'))) {
        await Document.collection.createIndex({ category: 1, createdAt: -1 });
        console.log('✓ Created index: { category: 1, createdAt: -1 }');
      } else {
        console.log('✓ Index { category: 1, createdAt: -1 } already exists');
      }
    } catch (indexError) {
      console.warn('⚠ Warning: Some indexes may already exist or failed to create:', indexError.message);
    }
    
    // Step 4: Log migration results
    console.log('\n[Step 4] Migration summary:');
    const totalDocuments = await Document.countDocuments();
    const documentsWithCategory = await Document.countDocuments({ category: { $exists: true, $ne: null } });
    const totalCategories = await Category.countDocuments();
    
    console.log('─────────────────────────────────────');
    console.log(`Total categories:           ${totalCategories}`);
    console.log(`Total documents:            ${totalDocuments}`);
    console.log(`Documents with category:    ${documentsWithCategory}`);
    console.log(`Documents without category: ${totalDocuments - documentsWithCategory}`);
    console.log(`Default category ID:        ${defaultCategory._id}`);
    console.log('─────────────────────────────────────');
    
    console.log('\n✓ Migration completed successfully!\n');
    
    return {
      success: true,
      defaultCategoryId: defaultCategory._id,
      totalDocuments,
      documentsWithCategory,
      totalCategories
    };
    
  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    console.error(error.stack);
    return {
      success: false,
      error: error.message
    };
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run migration if executed directly
if (require.main === module) {
  migrateToCategories()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = migrateToCategories;
