# Database Migrations

This folder contains database migration scripts for the Drawing Document API.

## Available Migrations

### add-category-system.js

Migrates the database to support the category system by:
- Creating a default "Uncategorized" category
- Updating all existing documents to reference the default category
- Creating necessary indexes on the category field

**Features:**
- ✓ Idempotent (safe to run multiple times)
- ✓ Detailed logging of migration progress
- ✓ Error handling and rollback safety
- ✓ Summary report after completion

## Running Migrations

### Using npm script (recommended):

```bash
npm run migrate:categories
```

### Direct execution:

```bash
node migrations/add-category-system.js
```

## Prerequisites

Before running migrations:
1. Ensure MongoDB is running
2. Set up your `.env` file with `MONGODB_URI`
3. Ensure all required models are in place

## Migration Output

The migration script provides detailed output:

```
Starting category system migration...

✓ Connected to MongoDB

[Step 1] Creating default category...
✓ Created default category: "Uncategorized" (ID: ...)

[Step 2] Updating documents without category...
Found X document(s) without category
✓ Updated X document(s) to default category

[Step 3] Creating indexes on category field...
✓ Created index: { category: 1 }
✓ Created index: { category: 1, status: 1 }
✓ Created index: { category: 1, createdAt: -1 }

[Step 4] Migration summary:
─────────────────────────────────────
Total categories:           X
Total documents:            X
Documents with category:    X
Documents without category: 0
Default category ID:        ...
─────────────────────────────────────

✓ Migration completed successfully!
```

## Idempotency

All migrations are designed to be idempotent, meaning:
- Running the same migration multiple times is safe
- The script detects existing data and skips unnecessary operations
- No duplicate data will be created

## Troubleshooting

### Connection Issues

If you see connection errors:
1. Verify MongoDB is running
2. Check your `MONGODB_URI` in `.env`
3. Ensure network connectivity to the database

### Permission Issues

If you see permission errors:
1. Verify your database user has write permissions
2. Check that indexes can be created on the collections

### Already Migrated

If all data is already migrated, you'll see:
```
✓ Default category already exists
✓ All documents already have a category assigned
✓ Index { category: 1 } already exists
```

This is normal and indicates the migration has already been applied.

## Best Practices

1. **Backup First**: Always backup your database before running migrations
2. **Test Environment**: Test migrations in a development environment first
3. **Review Logs**: Check the migration output for any warnings or errors
4. **Verify Results**: Query the database after migration to verify data integrity

## Exit Codes

- `0`: Migration completed successfully
- `1`: Migration failed (check error logs)
