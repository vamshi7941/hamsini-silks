# Promoters Feature - Implementation Guide

## Overview

The promoters feature has been fully implemented in the Hamsini Silks fullstack application. This allows admins to manage promoters with unique promo codes that track orders and revenue.

## What's New

### Role Types

- **Customer**: Existing patron login via phone/Google
- **Admin**: Full dashboard access with management capabilities (NEW: including promoters)
- **Promoter**: New role with personal dashboard showing promo code analytics

### Promo Code Format

`HS<Name Initials><Discount Percentage>`

- Example: `HSJD15` for John Doe with 15% discount
- Example: `HSAB20` for Alice Brown with 20% discount

---

## Backend Setup

### 1. New Database Schema

**File**: `backend/models/PromoterSchema.js`

- Stores promoter data with auto-generated promo codes
- Password hashing with bcrypt
- Tracking for created/updated timestamps

### 2. New Controller

**File**: `backend/controllers/promoterController.js`

- `loginPromoter`: Authenticate with promo code + password
- `createPromoter`: Admin creates promoter (requires admin secret)
- `getAllPromoters`: Fetch all promoters with analytics
- `updatePromoter`: Admin updates promoter details
- `deletePromoter`: Admin deletes promoter
- `getPromoterStats`: Get promo code analytics

### 3. New API Routes

**File**: `backend/routes/auth.js`

```
POST   /api/auth/promoter/login          - Promoter login
POST   /api/auth/promoter/create         - Create promoter (admin)
GET    /api/auth/promoter/all            - Get all promoters (admin)
PUT    /api/auth/promoter/:_id           - Update promoter (admin)
DELETE /api/auth/promoter/:_id           - Delete promoter (admin)
GET    /api/auth/promoter/stats/:promoCode - Get promo code stats
```

### 4. Updated Database Schema

**File**: `backend/models/OrdersSchema.js`

- Added `promoCode` field (optional) - tracks which promo code was used
- Added `discountApplied` field (number) - tracks discount amount

### 5. Environment Variables Required

```env
ADMIN_SECRET=your_admin_secret_key
SECRET=your_jwt_secret_key
```

---

## Frontend Setup

### 1. Updated Login Page

**File**: `frontend/src/components/pages/LoginPage.tsx`

- Changed from 2 tabs (Patron/Admin) to 3 tabs (Patron/Promoter/Admin)
- Promoter login uses promo code instead of email
- Integrated with promoterLogin API call

### 2. New Promoters API Module

**File**: `frontend/src/api/promoters.ts`

- Provides CRUD operations for promoters
- Admin can create, read, update, delete promoters
- Includes analytics functions

### 3. New Promoter Dashboard

**File**: `frontend/src/components/pages/PromotersDashboard.tsx`

- Personal dashboard accessible via `/promoter` route
- Displays:
  - Promo code with copy-to-clipboard
  - Total orders placed with promo code
  - Revenue generated
  - Discount percentage
  - Account details
- Refresh button to reload stats

### 4. New Promoters Management Component (Admin)

**File**: `frontend/src/components/admin/promoters.tsx`

- Tabular display of all promoters
- Columns: Name, Promo Code, Discount %, Orders, Revenue, Actions
- Create new promoter via modal form
- Edit promoter details
- Delete promoter with confirmation
- Search functionality by name, code, or phone

### 5. Updated Admin Dashboard

**File**: `frontend/src/components/pages/AdminDashboard.tsx`

- Added new "Promoters" tab
- Conditionally renders PromotersManagement component

### 6. Updated Admin Sidebar

**File**: `frontend/src/components/admin/sideBar.tsx`

- Added Promoters menu item with new users icon

### 7. Updated Context

**File**: `frontend/src/context/StoreContext.tsx`

- Extended User type to include 'promoter' role
- Added promoCode and discountPercentage fields

### 8. Updated Auth API

**File**: `frontend/src/api/auth.ts`

- Added promoterLogin function
- Updated login function to handle promoter role
- Redirects to `/promoter` route on promoter login

### 9. New Icons

**File**: `frontend/src/components/Icons.tsx`

- Added users icon for Promoters menu
- Added plus icon for create buttons
- Added loader icon for loading states
- Added refresh2 icon for refresh functionality

### 10. Updated Routing

**File**: `frontend/src/App.tsx`

- Added `/promoter` route for PromotersDashboard

### 11. Environment Variables Required

```env
VITE_ADMIN_SECRET=your_admin_secret_key
VITE_BACKEND_URL=http://localhost:4001
```

---

## How to Use

### For Admins

#### Creating a Promoter

1. Navigate to Admin Dashboard → Promoters tab
2. Click "Add Promoter" button
3. Fill in:
   - Full Name
   - Phone Number
   - Discount Percentage (1-100)
   - Password (for promoter login)
4. Promo code auto-generates (e.g., HSJD15)
5. Promoter can now login with their promo code

#### Managing Promoters

- **View Analytics**: See total orders and revenue for each promo code
- **Edit Promoter**: Update name, phone, or discount percentage
- **Delete Promoter**: Remove promoter from system

#### Admin Dashboard Promoters Tab Columns:

| Column     | Description                      |
| ---------- | -------------------------------- |
| Name       | Promoter's full name and phone   |
| Promo Code | Unique code for this promoter    |
| Discount   | Discount percentage offered      |
| Orders     | Number of orders using this code |
| Revenue    | Total revenue generated          |
| Actions    | Edit/Delete buttons              |

### For Promoters

#### Logging In

1. Go to Login page
2. Click on "🎯 Promoter" tab
3. Enter promo code (e.g., HSJD15)
4. Enter password
5. Redirected to Promoter Dashboard

#### Promoter Dashboard

1. View personal promo code
2. See total orders placed with code
3. See total revenue generated
4. Share promo code with customers (copy button)
5. Refresh stats button to update

### For Customers

#### Using Promo Code (Future Integration)

At checkout, customers can enter a promoter's promo code to receive the discount.
This needs to be integrated in your checkout/orders creation flow.

---

## Integration Checklist

### Backend

- [ ] Update `.env` with `ADMIN_SECRET` and `SECRET`
- [ ] Ensure MongoDB is running
- [ ] Test all promoter routes via Postman/Insomnia

### Frontend

- [ ] Update `.env` with `VITE_ADMIN_SECRET` and `VITE_BACKEND_URL`
- [ ] Test login with all three tabs (Patron/Promoter/Admin)
- [ ] Test admin promoters management
- [ ] Test promoter dashboard

### Additional Features to Implement

1. **Promo Code Discount Application**: Update checkout to apply discount when promo code is entered
2. **Promoter Commission Tracking**: Track earnings/commission for each promoter
3. **Promoter Statistics Export**: Allow admins to export analytics as CSV/PDF
4. **Email Notifications**: Notify promoters when orders are placed with their code
5. **Promo Code Expiry**: Add expiry dates for promo codes
6. **Promo Code Activation/Deactivation**: Allow admins to enable/disable codes

---

## File Structure Summary

```
backend/
├── controllers/
│   └── promoterController.js (NEW)
├── models/
│   ├── OrdersSchema.js (UPDATED)
│   └── PromoterSchema.js (NEW)
└── routes/
    └── auth.js (UPDATED)

frontend/src/
├── api/
│   └── promoters.ts (NEW)
├── components/
│   ├── Icons.tsx (UPDATED)
│   ├── admin/
│   │   ├── promoters.tsx (NEW)
│   │   └── sideBar.tsx (UPDATED)
│   └── pages/
│       ├── AdminDashboard.tsx (UPDATED)
│       ├── LoginPage.tsx (UPDATED)
│       └── PromotersDashboard.tsx (NEW)
├── context/
│   └── StoreContext.tsx (UPDATED)
├── api/
│   └── auth.ts (UPDATED)
└── App.tsx (UPDATED)
```

---

## Testing

### Backend Testing

```bash
# Login as promoter
curl -X POST http://localhost:4001/api/auth/promoter/login \
  -H "Content-Type: application/json" \
  -d '{"promoCode":"HSJD15","password":"password123"}'

# Create promoter (admin)
curl -X POST http://localhost:4001/api/auth/promoter/create \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: your_admin_secret" \
  -d '{
    "fullName":"John Doe",
    "phone":"9876543210",
    "discountPercentage":15,
    "password":"password123"
  }'

# Get all promoters
curl -X GET http://localhost:4001/api/auth/promoter/all \
  -H "x-admin-secret: your_admin_secret"

# Get promo code stats
curl -X GET http://localhost:4001/api/auth/promoter/stats/HSJD15
```

---

## Notes

- All passwords are hashed with bcrypt for security
- JWT tokens expire in 3 days
- Admin operations require x-admin-secret header
- Promo codes are unique and auto-generated
- Orders track which promo code was used and discount applied
