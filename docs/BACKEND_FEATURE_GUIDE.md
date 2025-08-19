# Backend Feature Implementation Guide

This guide provides a comprehensive step-by-step approach to implementing backend features in our KitRPC project, covering database schema, seeding, and API endpoints.

## Overview

Every backend feature implementation follows this pattern:

1. **Schema Design** - Define database models and relationships
2. **Database Migration** - Apply schema changes
3. **Seed Data** - Add initial/sample data
4. **API Endpoints** - Create tRPC routers with proper validation and permissions
5. **Integration** - Connect everything together

## Example: System Capacity Feature

We'll use the System Capacity feature as our example throughout this guide.

---

## Step 1: Schema Design

### 1.1 Analyze Requirements

Before writing any code, understand what you need:

- **System Capacity**: Track USDT/IRT capacity for the system
- **Capacity Transactions**: Allow admins to manually increase capacity
- **Relationships**: Link to existing Transaction model

### 1.2 Design Database Models

Edit `prisma/schema.prisma`:

```prisma
// Add new model
model SystemCapacity {
  id           String       @id @default(cuid())
  currency     CurrencyType
  amount       Float
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@unique([currency])
  @@index([currency])
}

// Extend existing enum
enum TransactionType {
  DEPOSIT
  WITHDRAWAL
  TRANSFER
  CAPACITY  // New type for capacity transactions
}
```

### 1.3 Key Design Principles

- **Use appropriate data types**: `Float` for amounts, `DateTime` for timestamps
- **Add constraints**: `@@unique([currency])` ensures one record per currency
- **Create indexes**: `@@index([currency])` for query performance
- **Follow naming conventions**: PascalCase for models, camelCase for fields
- **Include audit fields**: `createdAt`, `updatedAt` for tracking

---

## Step 2: Database Migration

### 2.1 Generate Migration

Run the migration command:

```bash
bun run db:migrate
```

This creates a new migration file in `prisma/migrations/`.

### 2.2 Review Migration

Always review the generated SQL to ensure it matches your expectations:

```sql
-- CreateTable
CREATE TABLE `SystemCapacity` (
    `id` VARCHAR(191) NOT NULL,
    `currency` ENUM('IRT', 'USDT') NOT NULL,
    `amount` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SystemCapacity_currency_key`(`currency`),
    INDEX `SystemCapacity_currency_idx`(`currency`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `Transaction` MODIFY `type` ENUM('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'CAPACITY') NOT NULL;
```

### 2.3 Apply Migration

The migration is automatically applied when you run `bun run db:migrate`.

---

## Step 3: Seed Data

### 3.1 Add Permissions

Edit `prisma/seed.ts` to include necessary permissions:

```typescript
const permissions = [
	// ... existing permissions
	{
		name: 'capacity:manage',
		description: 'مدیریت ظرفیت سیستم',
		resource: 'capacity',
		action: 'manage'
	}
];
```

### 3.2 Add Sample Data (Optional)

Add initial capacity data if needed:

```typescript
// Add after existing seed data
const existingCapacity = await prisma.systemCapacity.count();
if (existingCapacity === 0) {
	console.log('💰 ایجاد ظرفیت اولیه سیستم...');

	await prisma.systemCapacity.createMany({
		data: [
			{
				currency: 'USDT',
				amount: 10000.0
			},
			{
				currency: 'IRT',
				amount: 500000000.0
			}
		]
	});

	console.log('✅ ظرفیت اولیه سیستم ایجاد شد!');
}
```

### 3.3 Run Seed

```bash
bun run db:seed
```

---

## Step 4: API Endpoints

### 4.1 Create Router File

Create `src/lib/trpc/capacity.ts`:

```typescript
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '$lib/prisma';
import { createPermissionMiddleware } from './middleware';
import { t } from './trpc';
import { CurrencyType, TransactionType } from '@prisma/client';

// Input validation schemas
const createCapacityTransactionSchema = z.object({
	currency: z.nativeEnum(CurrencyType),
	amount: z.number().positive('Amount must be positive'),
	description: z.string().optional()
});

const getCapacityTransactionsSchema = z.object({
	currency: z.nativeEnum(CurrencyType).optional(),
	limit: z.number().min(1).max(100).default(10),
	offset: z.number().min(0).default(0)
});

// Admin middleware
const adminOnly = createPermissionMiddleware('capacity', 'manage');
const adminProcedure = t.procedure.use(adminOnly);

export const capacityRouter = t.router({
	// Get current system capacity stats
	getStats: adminProcedure.query(async () => {
		try {
			return await prisma.systemCapacity.findMany({
				orderBy: { currency: 'asc' }
			});
		} catch (error: any) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch capacity stats',
				cause: error
			});
		}
	}),

	// Create capacity transaction
	createCapacityTransaction: adminProcedure
		.input(createCapacityTransactionSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				return await prisma.$transaction(async (tx) => {
					// Create transaction record
					const transaction = await tx.transaction.create({
						data: {
							userId: ctx.user.id,
							type: TransactionType.CAPACITY,
							currency: input.currency,
							amount: input.amount,
							status: 'COMPLETED',
							description: input.description || `Admin capacity increase for ${input.currency}`
						}
					});

					// Update system capacity
					const existingCapacity = await tx.systemCapacity.findUnique({
						where: { currency: input.currency }
					});

					let updatedCapacity;
					if (existingCapacity) {
						updatedCapacity = await tx.systemCapacity.update({
							where: { currency: input.currency },
							data: { amount: existingCapacity.amount + input.amount }
						});
					} else {
						updatedCapacity = await tx.systemCapacity.create({
							data: {
								currency: input.currency,
								amount: input.amount
							}
						});
					}

					return { transaction, capacity: updatedCapacity };
				});
			} catch (error: any) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create capacity transaction',
					cause: error
				});
			}
		}),

	// Get capacity transactions
	getCapacityTransactions: adminProcedure
		.input(getCapacityTransactionsSchema)
		.query(async ({ input }) => {
			try {
				const where: any = { type: TransactionType.CAPACITY };
				if (input.currency) {
					where.currency = input.currency;
				}

				const [transactions, totalCount] = await Promise.all([
					prisma.transaction.findMany({
						where,
						include: {
							user: {
								select: { id: true, username: true }
							}
						},
						orderBy: { createdAt: 'desc' },
						take: input.limit,
						skip: input.offset
					}),
					prisma.transaction.count({ where })
				]);

				return {
					transactions,
					totalCount
				};
			} catch (error: any) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch capacity transactions',
					cause: error
				});
			}
		})
});
```

### 4.2 Key API Design Principles

- **Input Validation**: Use Zod schemas for all inputs
- **Permission Control**: Use middleware for authorization
- **Error Handling**: Wrap operations in try-catch with proper TRPCError
- **Database Transactions**: Use `prisma.$transaction` for atomic operations
- **Date Serialization**: Convert dates to ISO strings for client consumption
- **Pagination**: Include limit/offset for list endpoints
- **Filtering**: Allow optional filters for better UX

---

## Step 5: Integration

### 5.1 Register Router

Add to `src/lib/trpc/router.ts`:

```typescript
import { capacityRouter } from './capacity';

export const router = t.router({
	// ... existing routers
	capacity: capacityRouter
});
```

### 5.2 Update Types

The router types are automatically inferred, so no manual type updates needed.

---

## Best Practices

### Database Design

- Always include `id`, `createdAt`, `updatedAt` fields
- Use appropriate constraints (`@@unique`, `@@index`)
- Follow consistent naming conventions
- Consider performance implications of indexes

### API Design

- Validate all inputs with Zod
- Use proper HTTP status codes via TRPCError
- Implement proper authorization
- Handle errors gracefully
- Use database transactions for multi-step operations

### Security

- Always use permission middleware for protected endpoints
- Validate user permissions at the resource level
- Sanitize inputs to prevent injection attacks
- Log sensitive operations for audit trails

### Performance

- Use database indexes for frequently queried fields
- Implement pagination for list endpoints
- Use `select` to limit returned fields when possible
- Consider caching for frequently accessed data

---

## Common Patterns

### 1. CRUD Operations

```typescript
// Create
create: adminProcedure
  .input(createSchema)
  .mutation(async ({ input }) => {
    return await prisma.model.create({ data: input });
  }),

// Read (single)
getById: procedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    return await prisma.model.findUnique({ where: { id: input.id } });
  }),

// Read (list)
getAll: procedure
  .input(paginationSchema)
  .query(async ({ input }) => {
    const [items, total] = await Promise.all([
      prisma.model.findMany({
        take: input.limit,
        skip: input.offset,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.model.count()
    ]);
    return { items, total };
  }),

// Update
update: adminProcedure
  .input(updateSchema)
  .mutation(async ({ input }) => {
    return await prisma.model.update({
      where: { id: input.id },
      data: input.data
    });
  }),

// Delete
delete: adminProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    return await prisma.model.delete({ where: { id: input.id } });
  })
```

### 2. Permission Middleware

```typescript
// For specific resource permissions
const resourcePermission = createPermissionMiddleware('resource', 'action');

// For admin-only operations
const adminOnly = createPermissionMiddleware('admin', 'manage');

// For authenticated users
const authenticated = t.procedure.use(isAuthenticated);
```

### 3. Input Validation Schemas

```typescript
// Basic schemas
const idSchema = z.object({ id: z.string().cuid() });
const paginationSchema = z.object({
	limit: z.number().min(1).max(100).default(10),
	offset: z.number().min(0).default(0)
});

// Feature-specific schemas
const createItemSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	amount: z.number().positive()
});
```

---

## Testing Your Implementation

### 1. Database Testing

```bash
# Reset database
bun run db:reset

# Run migrations
bun run db:migrate

# Seed data
bun run db:seed

# Check database
bun run db:studio
```

### 2. API Testing

Use your frontend or API testing tools to verify:

- All endpoints respond correctly
- Validation works as expected
- Permissions are enforced
- Error handling works properly

---

## Troubleshooting

### Common Issues

1. **Migration Fails**
   - Check for syntax errors in schema
   - Ensure no conflicting constraints
   - Verify database connection

2. **Permission Denied**
   - Check if permission exists in seed
   - Verify user has the permission
   - Ensure middleware is correctly applied

3. **Type Errors**
   - Run `bun run db:generate` to update Prisma client
   - Check import statements
   - Verify enum values match schema

4. **Runtime Errors**
   - Check database constraints
   - Verify required fields are provided
   - Review error logs for details

---

## Conclusion

This guide provides a comprehensive approach to implementing backend features. Always follow this pattern:

1. **Plan** your schema and relationships
2. **Implement** database changes with migrations
3. **Seed** necessary data and permissions
4. **Create** well-structured API endpoints
5. **Test** thoroughly before deployment

By following these patterns and best practices, you'll create maintainable, secure, and performant backend features.
