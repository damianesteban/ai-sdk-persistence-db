# Migration from Drizzle to Prisma

This document describes the migration from Drizzle ORM to Prisma.

## Changes Made

### 1. Schema Definition
- **Before**: Schema defined in `lib/db/schema.ts` using Drizzle's `pgTable`
- **After**: Schema defined in `prisma/schema.prisma` using Prisma schema language

### 2. Database Client
- **Before**: Drizzle client created with `drizzle()` and Pool from `pg`
- **After**: Prisma Client instantiated with `new PrismaClient()`

### 3. Database Actions
All queries in `lib/db/actions.ts` were converted from Drizzle to Prisma:
- `db.insert()` → `db.model.create()`
- `db.select()` → `db.model.findMany()`
- `db.update()` → `db.model.update()`
- `db.delete()` → `db.model.delete()`
- `db.transaction()` → `db.$transaction()`
- `db.query.messages.findMany()` → `db.message.findMany()`

### 4. Type Exports
- **Before**: Types inferred from Drizzle schema using `$inferInsert` and `$inferSelect`
- **After**: Types from Prisma using `Prisma.ModelCreateInput` and `Prisma.ModelGetPayload<>`

### 5. Database Scripts
Updated package.json scripts:
- `db:push`: `drizzle-kit push` → `prisma db push`
- `db:studio`: `drizzle-kit studio` → `prisma studio`
- `db:generate`: Added `prisma generate` command

### 6. Dependencies
- **Removed**: `drizzle-orm`, `drizzle-kit`
- **Added**: `@prisma/client`, `prisma`

## Data Integrity Constraints

The original Drizzle schema included CHECK constraints to ensure data integrity. While Prisma doesn't support CHECK constraints in the schema file, the application logic in `lib/utils/message-mapping.ts` enforces these constraints at the application level.

If you need to add CHECK constraints at the database level, you can:
1. Use `prisma migrate dev` to create a migration
2. Edit the migration SQL file to add CHECK constraints manually
3. Apply the migration

## Migration Steps for Existing Databases

If you have an existing database with Drizzle:

1. **Backup your data**: Always backup before migrating
   ```bash
   pg_dump your_database > backup.sql
   ```

2. **Generate Prisma Client**:
   ```bash
   pnpm db:generate
   ```

3. **Introspect existing database** (optional):
   ```bash
   prisma db pull
   ```

4. **Push schema to database**:
   ```bash
   pnpm db:push
   ```

   Note: Since the table structures are identical, this should work without data loss.

5. **Verify migration**:
   - Test all database operations
   - Verify data integrity
   - Check that all queries work as expected

## Key Differences

1. **ID Generation**: 
   - Drizzle used `generateId()` from the AI SDK
   - Prisma uses `@default(cuid())` which is functionally equivalent

2. **Relations**:
   - Drizzle required separate `relations.ts` file
   - Prisma defines relations directly in the schema

3. **Indexes**:
   - Both support indexes similarly
   - Syntax differs but functionality is the same

4. **Cascade Deletes**:
   - Both support `onDelete: Cascade`
   - Implemented identically in both ORMs

## Advantages of Prisma

- Type-safe database client with excellent TypeScript integration
- Built-in database studio for viewing and editing data
- Better migration management
- More intuitive query syntax
- Extensive documentation and community support
