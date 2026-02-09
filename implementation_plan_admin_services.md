# Admin Service Management API Implementation

## Overview
Implemented backend APIs to allow the Admin Panel to create Services and manage Vendor Specializations. This supports adding specific service items like "Haircut" or "Shave" to any Category.

## Database Changes (Run Migration)
Created a new migration file: `server/migrations/create_admin_service_management.sql` which adds:
1.  `service_items` (Ensures existence, adds constraints)
2.  `vendor_services` (New table for linking Vendors to specific Service Items)

**Action Required**: Please run this SQL script in your Supabase SQL Editor.

## New Admin APIs (`/api/admin/services`)

### 1. Create Category
- **Endpoint**: `POST /api/admin/services/categories`
- **Body**: `{ "name": "Salon", "slug": "salon", "description": "...", "image": "..." }`

### 2. Create Sub-Service (Service Item)
- **Endpoint**: `POST /api/admin/services/items`
- **Body**: `{ "categoryId": "UUID", "name": "Haircut", "description": "...", "basePrice": 500, "imageUrl": "..." }`
- **Use Case**: This allows you to add specific services like "Haircut" or "Shave" to any Category (e.g., Men's Salon).

### 3. List Sub-Services
- **Endpoint**: `GET /api/admin/services/items/:categoryId`
- **Response**: List of all items under a category.

### 4. Assign Service to Vendor (Specialization)
- **Endpoint**: `POST /api/admin/services/assign-vendor`
- **Body**: `{ "vendorId": "UUID", "serviceItemId": "UUID", "customPrice": 600 }`
- **Use Case**: Updates a vendor's profile to indicate they perform this specific service, optionally with a custom price.
