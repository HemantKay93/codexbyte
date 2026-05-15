# Byteevolvr — Backend & Admin Panel Refactor Master Plan

## Project Overview

This document defines the required improvements, cleanup tasks, backend restructuring, admin workflow implementation, and architecture upgrades required to transform the current Byteevolvr platform into a scalable production-grade ecommerce and admin management system.

The project has significantly improved in:

- Monorepo architecture
- Modular package structure
- Supabase schema design
- Frontend organization
- Validation and middleware direction
- Backend structure thinking

However, several critical engineering and business workflow improvements are still required.

---

# Current Engineering Assessment

| Area                       | Current Status         |
| -------------------------- | ---------------------- |
| Architecture               | Good                   |
| Backend Engineering        | Intermediate           |
| Admin Panel                | Functional but shallow |
| Scalability                | Good direction         |
| Production Readiness       | Partial                |
| Business Workflow Handling | Incomplete             |

---

# PRIMARY ENGINEERING GOALS

1. Remove dead code and unnecessary abstractions
2. Complete backend enterprise architecture
3. Build real admin workflows
4. Implement transaction-safe business logic
5. Improve RBAC and permissions
6. Standardize APIs
7. Improve logging and monitoring
8. Build production-grade order and inventory engine
9. Simplify unnecessary complexity
10. Improve maintainability and scalability

---

# DEAD CODE & CLEANUP TASKS

## Remove or Move Temporary Development Files

Current issue:

```txt
scratch/
  check_db.js
  check_duplicates.js
  debug_cms.js
```

### Required Action

Either:

- Delete these files
  OR
- Move them into:

```txt
tools/
dev-scripts/
```

---

## Remove Unused or Duplicate Helpers

### Problems

- Duplicate Supabase wrappers
- Duplicate utility methods
- Generic helpers used only once
- Experimental abstractions

### Required Action

Keep only centralized domain services:

```txt
/services/
  auth.service.ts
  product.service.ts
  order.service.ts
  admin.service.ts
```

Delete:

- duplicate API wrappers
- old fetch utilities
- unused helper functions
- experimental abstraction layers

---

## Remove Over-Wrapped UI Components

### Current Problem

Excessive nesting:

```txt
Wrapper
 → Container
   → Section
     → InnerContainer
```

### Keep Only

```txt
Layout
Section
Card
Modal
Button
Input
Table
```

Delete:

- unnecessary wrapper components
- one-time layout wrappers
- unused UI abstractions

---

## Remove Unnecessary Global State

### Zustand Should Only Handle

```txt
Auth
Cart
Orders
Admin
Theme
```

Everything else should remain local component state.

---

# BACKEND REFACTOR PLAN

## Required Backend Architecture

```txt
backend/src/
  controllers/
  services/
  repositories/
  validators/
  middlewares/
  routes/
  jobs/
  utils/
  config/
  logs/
  sockets/
```

---

## Required Architecture Flow

```txt
Route
 → Controller
   → Service
     → Repository
       → Database
```

### Important Rules

- No business logic inside routes
- No database queries inside controllers
- Controllers should only handle request/response
- Services should contain business logic
- Repositories should handle database access only

---

# ADMIN PANEL IMPROVEMENTS

## Current Problem

Admin panel is still UI-first instead of workflow-first.

The admin system must become an operational business engine.

---

# PRODUCT MANAGEMENT IMPROVEMENTS

## Required Features

### Product CRUD

- Create products
- Update products
- Delete products
- Archive products
- Enable/disable products

### Inventory Features

- SKU generation
- Stock tracking
- Inventory history
- Low stock alerts
- Warehouse assignment

### Product Variants

- Size variants
- Color variants
- Variant stock
- Variant pricing

### Product Media

- Multi-image upload
- Thumbnail management
- Gallery ordering

---

# ORDER MANAGEMENT IMPROVEMENTS

## Required Order Lifecycle

```txt
Pending
→ Confirmed
→ Packed
→ Shipped
→ Delivered
→ Returned
→ Refunded
```

## Admin Order Features

- Order status updates
- Courier assignment
- Tracking ID generation
- Invoice generation
- Refund handling
- Return approval workflow
- Order activity timeline

---

# USER MANAGEMENT IMPROVEMENTS

## Required Features

### User Operations

- View users
- Block/unblock users
- Reset passwords
- View purchase history
- View addresses

### Role System

Required roles:

```txt
Super Admin
Admin
Staff
Customer
```

### Permissions

- Product permissions
- Order permissions
- User permissions
- Inventory permissions
- Analytics permissions

---

# INVENTORY & WAREHOUSE ENGINE

## Required Features

### Warehouse Management

- Create warehouses
- Transfer stock
- Track stock movement
- Inventory synchronization
- Low stock notifications

### Inventory History

Track:

- Added stock
- Removed stock
- Transfers
- Adjustments
- Returns

---

# TRANSACTIONAL BUSINESS LOGIC

## Critical Missing Improvement

The system currently lacks transactional business flows.

### Example

Order creation must:

1. Reserve stock
2. Create payment record
3. Generate invoice
4. Create audit log
5. Send confirmation notification

All atomically.

---

# API STANDARDIZATION

## Required API Structure

All APIs should return:

```json
{
  "success": true,
  "message": "",
  "data": [],
  "pagination": {}
}
```

---

## Required API Features

- Pagination
- Filtering
- Sorting
- Searching
- API versioning
- Validation

---

# VALIDATION SYSTEM

## Required Validation

Use:

- Zod
  OR
- Joi

Validate:

- Products
- Orders
- Users
- Addresses
- Payments
- Coupons

---

# ERROR HANDLING

## Required Improvements

### Add

- Global error middleware
- Async wrapper
- Structured API errors
- Logging integration

### Example

```txt
app.use(globalErrorHandler)
```

---

# SECURITY IMPROVEMENTS

## Required Security Features

### Add

- Helmet
- Rate limiting
- RBAC middleware
- Secure headers
- Audit logs
- Input sanitization

### Required Middleware

```txt
requireAuth
requireAdmin
requirePermission
```

---

# LOGGING & MONITORING

## Required Logging

Track:

- Admin actions
- Order updates
- Payment failures
- Login attempts
- Security events
- Inventory changes

### Recommended Tools

- Pino
  OR
- Winston

---

# PERFORMANCE IMPROVEMENTS

## Frontend

### Add

- React.lazy
- Suspense
- TanStack Query
- Query caching
- Route splitting

---

## Backend

### Add

- Query optimization
- Pagination
- Redis caching
- DB indexing

---

# DATABASE IMPROVEMENTS

## Add Fields

```txt
created_by
updated_by
deleted_at
status
audit_log_id
```

---

## Required Features

- Foreign keys
- Constraints
- Indexes
- Soft deletes
- Transaction-safe operations
- Audit logging

---

# REQUIRED DOMAIN MODULES

Create:

```txt
modules/
  auth/
  product/
  inventory/
  order/
  payment/
  admin/
```

Each module should contain:

```txt
controller
service
repository
validator
types
```

---

# ADMIN DASHBOARD REQUIREMENTS

## Dashboard APIs

Required APIs:

- Total revenue
- Total orders
- Monthly sales
- Low stock products
- Top-selling products
- User growth
- Recent activities

---

# FEATURES TO PRIORITIZE NEXT

## Priority 1

Implement real admin workflows.

---

## Priority 2

Implement transactional order engine.

---

## Priority 3

Implement RBAC properly.

---

## Priority 4

Refactor backend into strict service/repository architecture.

---

## Priority 5

Split domain APIs and stores.

---

# THINGS TO AVOID NOW

Do NOT focus on:

- microservices
- kubernetes
- over-abstraction
- unnecessary architecture layers
- advanced infra complexity

Until:

- workflows are complete
- permissions are complete
- transactions are stable
- admin operations are mature

---

# ENGINEERING PRINCIPLES TO FOLLOW

1. Business workflows first
2. Architecture second
3. Simplicity over unnecessary abstraction
4. Strict separation of concerns
5. Reusable but practical architecture
6. Production-grade validation
7. Consistent API contracts
8. Maintainable folder structure
9. Strong logging and monitoring
10. Transaction-safe business logic

---

# MASTER PROMPT FOR ANTIGRAVITY

## USE THIS PROMPT WITH ANTIGRAVITY

You are a senior enterprise backend architect and ecommerce platform engineer.

Analyze my existing monorepo ecommerce project and refactor it into a production-grade scalable backend and admin system.

The project uses:

- React frontend
- Express backend
- Supabase PostgreSQL
- Zustand
- Modular packages

Your tasks:

1. Remove dead code and unused abstractions
2. Simplify unnecessary architecture
3. Implement enterprise backend structure
4. Refactor into controller-service-repository pattern
5. Build production-grade admin workflows
6. Implement RBAC and permissions
7. Build transactional order and inventory engine
8. Implement logging, validation, and monitoring
9. Standardize APIs
10. Improve scalability and maintainability

Required backend structure:

```txt
backend/src/
  controllers/
  services/
  repositories/
  validators/
  middlewares/
  routes/
  jobs/
  utils/
```

Required domain modules:

```txt
modules/
  auth/
  product/
  inventory/
  order/
  payment/
  admin/
```

Required admin workflows:

- Product management
- Inventory management
- Warehouse management
- Order lifecycle
- Refunds and returns
- Analytics and reports
- User management
- Permissions

Required engineering rules:

- No business logic inside routes
- No database queries inside controllers
- Use service-repository architecture
- Implement RBAC properly
- Add validation everywhere
- Add transaction-safe workflows
- Add audit logs
- Add centralized error handling
- Add API response standardization

Important priorities:

1. Business workflows first
2. Stability second
3. Scalability third
4. Architecture cleanliness fourth

Avoid unnecessary over-engineering.

Focus on:

- maintainability
- production readiness
- operational workflows
- admin functionality
- transactional integrity
- scalability

Generate:

1. Exact refactor plan
2. File-by-file improvements
3. Dead code removal suggestions
4. Backend architecture improvements
5. Admin workflow implementation plan
6. API improvements
7. Validation improvements
8. Logging improvements
9. Security improvements
10. Step-by-step executi
