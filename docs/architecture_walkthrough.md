# ByteEvolvr Architecture Walkthrough

This document outlines the refactored architecture of the ByteEvolvr platform, following the "Master Refactor Plan" to improve maintainability, scalability, and backend engineering standards.

## 1. Project Structure

The project has transitioned to a clean, domain-driven modular structure.

### Backend (`/backend/src`)
- **`modules/`**: Contains feature-based domain logic. Each module is self-contained.
  - `auth/`: Authentication, tokens, and identity.
  - `product/`: Catalog, SKU generation, and categories.
  - `order/`: Checkout, order management, and returns.
  - `inventory/`: Multi-warehouse stock tracking and movements.
  - `admin/`: Dashboard stats, customer management, and audit logs.
  - `cms/`: Content management for frontend pages.
  - `lead/`: CRM, contact forms, and lead tracking.
  - `...`: Other domains (marketing, pos, shipping, support, etc.)
- **`services/`**: Cross-cutting system services (Audit, Cache, Logger, Job, Email).
- **`middlewares/`**: Shared Express middlewares (Auth, Error, Validate, Permission).
- **`config/`**: Database and infrastructure configuration (Supabase).
- **`utils/`**: Shared utility functions.

### Packages (`/packages`)
- **`api-client`**: Centralized API communication layer for all frontend apps.
- **`store`**: Consolidated Zustand stores for global state (Auth, Cart, Orders, Admin).
- **`ui`**: Shared UI component library.

## 2. Backend Module Pattern

Each domain module follows a consistent pattern:
- `*.routes.ts`: Defines API endpoints and attaches validation/auth middlewares.
- `*.controller.ts`: Handles Express request/response logic.
- `*.service.ts`: Contains business logic and orchestrates repositories.
- `*.repository.ts`: Encapsulates all database (Supabase) interactions.
- `*.validator.ts`: Zod/Joi schemas for request validation.

## 3. Standardized API Responses

All APIs now return a consistent JSON structure:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { "page": 1, "total": 100 } // optional
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "error": { ... },
  "stack": "..." // Only in development
}
```

## 4. State Management

Redux has been fully removed in favor of lightweight Zustand stores in `@byteevolvr/store`.
- `useAuthStore`: Handles admin and user authentication.
- `cartStore`: Manages shopping cart state.
- `orderStore`: Tracks active order status.
- `adminStore`: Manages admin dashboard state.

## 5. Security & Data Integrity

- **Admin Client**: The backend uses `getAdminClient()` for database operations, enforcing that all data access is mediated by the service layer.
- **Audit Logging**: All critical actions (Create Product, Update Order, etc.) are automatically logged via `AuditService`.
- **Soft Deletes**: All core entities support `deleted_at` filtering to prevent data loss.
- **Transactional Integrity**: Complex operations (like Checkout) use Database RPCs or transactional patterns to ensure atomicity.

## 6. How to Add a New Feature

1.  **Backend**:
    - Create a new directory in `backend/src/modules/<feature>`.
    - Implement Repository, Service, Controller, and Routes.
    - Register the route in `backend/src/server.ts`.
2.  **API Client**:
    - Add a new service file in `packages/api-client/src/services/<feature>.ts`.
    - Export the service methods.
3.  **Frontend**:
    - Use the new API client service in your components.
    - Use the appropriate global store if cross-component state is needed.
