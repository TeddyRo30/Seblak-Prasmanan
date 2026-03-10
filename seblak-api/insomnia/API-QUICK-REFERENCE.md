# 📖 SEBLAK PRASMANAN API - QUICK REFERENCE

**Version:** 1.0  
**Base URL:** `{{ base_url }}` (Staging: http://localhost:3000/api/v1)  
**Format:** REST JSON  
**Auth:** Bearer JWT Token  

---

## 🔐 AUTHENTICATION

### Register
```
POST /auth/register
{
  "email": "user@example.com",
  "password": "Pass123!",
  "full_name": "Name",
  "phone": "+62XXXX"
}
Response: 201 → { data: { id, email, role } }
```

### Login
```
POST /auth/login
{
  "email": "user@example.com",
  "password": "Pass123!"
}
Response: 200 → { data: { user, tokens: { access_token, refresh_token } } }
```

### Refresh Token
```
POST /auth/refresh
{ "refresh_token": "token" }
Response: 200 → { data: { access_token, expires_in } }
```

---

## 🍜 MENU (No Auth)

### Get Categories
```
GET /menu/categories
Response: 200 → { data: [ { id, name, item_count } ] }
```

### Get Items by Category
```
GET /menu/categories/{category_id}/items?limit=10&offset=0
Response: 200 → { data: [ items ], pagination: { total, has_more } }
```

### Search Items
```
GET /menu/search?q=bakso&limit=20
Response: 200 → { data: [ matching_items ] }
```

### Get Item Detail
```
GET /menu/items/{menu_item_id}
Response: 200 → { data: { id, name, price, stock, description } }
```

---

## 🛒 ORDERS (Requires Auth)

### Create Order
```
POST /orders
Headers: 
  Authorization: Bearer {{ access_token }}
  Idempotency-Key: uuid-{{ $timestamp }}

{
  "order_type": "DELIVERY|TAKE_AWAY|DINE_IN",
  "level_pedas": "ORIGINAL|SEDANG|PEDAS|PEDAS_SEKALI",
  "kuah_varian": "NYEMEK|NORMAL|BANJIR",
  "payment_method": "CASH|QRIS|BANK_TRANSFER|ONLINE",
  "items": [
    { "menu_item_id": "uuid", "quantity": 2, "special_notes": "..." }
  ],
  
  // DELIVERY only:
  "delivery_address": "Jl. Contoh No. 123",
  "delivery_latitude": -6.2293,
  "delivery_longitude": 106.7924,
  "delivery_time": "2024-01-15T15:30:00Z",
  
  // TAKE_AWAY only:
  "pickup_time": "ASAP|2024-01-15T15:30:00Z",
  
  // DINE_IN only:
  "table_number": 3
}

Response: 201 → { data: { id, order_number, total, status } }
```

### List My Orders
```
GET /orders?limit=10&offset=0&status=PENDING&order_by=-created_at
Headers: Authorization: Bearer {{ access_token }}
Response: 200 → { data: [ orders ], pagination }
```

### Get Order Detail
```
GET /orders/{order_id}
Headers: Authorization: Bearer {{ access_token }}
Response: 200 → { data: { id, items, total, status, payment, timeline } }
```

### Track Order (Live)
```
GET /orders/{order_id}/tracking
Headers: Authorization: Bearer {{ access_token }}
Response: 200 → { data: { status_timeline, driver_info, eta } }
```

### Get Status History
```
GET /orders/{order_id}/status-history
Headers: Authorization: Bearer {{ access_token }}
Response: 200 → { data: [ { from, to, at, by, reason } ] }
```

### Cancel Order
```
DELETE /orders/{order_id}
Headers: Authorization: Bearer {{ access_token }}
{ "reason": "Changed mind" }
Response: 200 → { data: { status: "CANCELLED" } }
```

---

## 💳 PAYMENTS (Requires Auth)

### Create Payment
```
POST /orders/{order_id}/payment
Headers: Authorization: Bearer {{ access_token }}
{ "payment_method": "QRIS|CASH|BANK_TRANSFER|ONLINE" }
Response: 201 → { data: { payment_id, qr_code?, bank_transfer?, redirect_url? } }
```

### Get Payment Status
```
GET /orders/{order_id}/payments
Headers: Authorization: Bearer {{ access_token }}
Response: 200 → { data: { status, method, amount, confirmed_at } }
```

### Get Payment Receipt
```
GET /payments/{payment_id}/receipt
Headers: Authorization: Bearer {{ access_token }}
Response: 200 → PDF file or { data: receipt_data }
```

### Webhook - Midtrans
```
POST /payments/webhook/midtrans
{
  "transaction_id": "xxx",
  "order_id": "xxx",
  "gross_amount": 23000,
  "transaction_status": "settlement|pending|deny",
  "signature_key": "xxx"
}
Response: 200 → { ok: true }
```

---

## 👤 USER PROFILE (Requires Auth)

### Get My Profile
```
GET /users/me
Headers: Authorization: Bearer {{ access_token }}
Response: 200 → { data: { id, email, full_name, phone, role } }
```

### Update Profile
```
PATCH /users/me
Headers: Authorization: Bearer {{ access_token }}
{ "full_name": "New Name", "phone": "+628123..." }
Response: 200 → { data: updated_user }
```

### Add Address
```
POST /users/me/addresses
Headers: Authorization: Bearer {{ access_token }}
{
  "label": "Rumah|Kantor|Lainnya",
  "full_address": "Jl. Contoh No. 123",
  "latitude": -6.2293,
  "longitude": 106.7924,
  "is_default": true|false
}
Response: 201 → { data: { id, label, address } }
```

### Get Addresses
```
GET /users/me/addresses
Headers: Authorization: Bearer {{ access_token }}
Response: 200 → { data: [ addresses ] }
```

### Change Password
```
POST /users/me/change-password
Headers: Authorization: Bearer {{ access_token }}
{
  "current_password": "Old123!",
  "new_password": "New456!",
  "confirm_password": "New456!"
}
Response: 200 → { data: { success: true } }
```

---

## 👨‍💼 ADMIN DASHBOARD (Requires admin_token)

### Dashboard Overview
```
GET /admin/dashboard
Headers: Authorization: Bearer {{ admin_token }}
Response: 200 → {
  data: {
    today: { total_orders, revenue, completion_rate },
    breakdown: { by_type, by_status },
    inventory: { low_stock_items },
    top_items: [ { name, sold } ]
  }
}
```

### Detailed Metrics
```
GET /admin/dashboard/metrics?date=2024-01-15
Headers: Authorization: Bearer {{ admin_token }}
Response: 200 → { data: detailed_metrics }
```

---

## 📦 ADMIN MENU (Requires admin_token)

### List Items
```
GET /admin/menu/items?limit=50&offset=0&category_id=xxx
Headers: Authorization: Bearer {{ admin_token }}
Response: 200 → { data: [ items ], pagination }
```

### Create Item
```
POST /admin/menu/items
Headers: Authorization: Bearer {{ admin_token }}
{
  "name": "Item Name",
  "category_id": "uuid",
  "price_per_unit": 3000,
  "unit": "pcs|gram|bunch",
  "stock_quantity": 100,
  "low_stock_threshold": 20,
  "description": "...",
  "image_url": "https://..."
}
Response: 201 → { data: { id, ... } }
```

### Update Item
```
PATCH /admin/menu/items/{menu_item_id}
Headers: Authorization: Bearer {{ admin_token }}
{
  "price_per_unit": 3500,
  "description": "Updated desc"
}
Response: 200 → { data: updated_item }
```

### Update Stock
```
PATCH /admin/menu/items/{menu_item_id}/stock
Headers: Authorization: Bearer {{ admin_token }}
{
  "stock_quantity": 150,
  "action": "STOCK_IN|STOCK_OUT|MANUAL_ADJUST",
  "reason": "Morning restock"
}
Response: 200 → { data: { new_stock, log_id } }
```

### Get Stock History
```
GET /admin/menu/items/{menu_item_id}/stock-history?limit=20
Headers: Authorization: Bearer {{ admin_token }}
Response: 200 → { data: [ logs ], pagination }
```

### Delete Item
```
DELETE /admin/menu/items/{menu_item_id}
Headers: Authorization: Bearer {{ admin_token }}
Response: 200 → { data: { success: true } }
```

---

## 📋 ADMIN ORDERS (Requires admin_token)

### List All Orders
```
GET /admin/orders?limit=50&status=PENDING&order_by=-created_at
Headers: Authorization: Bearer {{ admin_token }}
Response: 200 → { data: [ orders ], pagination }
```

### Get Order Detail
```
GET /admin/orders/{order_id}
Headers: Authorization: Bearer {{ admin_token }}
Response: 200 → { data: { id, items, timeline, driver, payment, ... } }
```

### Update Order Status
```
PATCH /admin/orders/{order_id}/status
Headers: Authorization: Bearer {{ admin_token }}
{
  "status": "NEW|CONFIRMED|PREPARING|READY|...",
  "reason": "Kitchen acknowledged"
}
Response: 200 → { data: { previous_status, new_status, changed_at } }
```

### Get Status History
```
GET /admin/orders/{order_id}/status-history
Headers: Authorization: Bearer {{ admin_token }}
Response: 200 → { data: [ { from, to, at, by } ] }
```

### Rollback Status
```
POST /admin/orders/{order_id}/rollback-status
Headers: Authorization: Bearer {{ admin_token }}
{ "target_status": "PREPARING" }
Response: 200 → { data: { success: true } }
```

### Assign Driver
```
POST /admin/orders/{order_id}/assign-driver
Headers: Authorization: Bearer {{ admin_token }}
{ "driver_id": "uuid-driver" }
Response: 200 → { data: { order_id, driver_id, assigned_at } }
```

---

## 🚗 ADMIN DRIVERS (Requires admin_token)

### List Drivers
```
GET /admin/drivers?limit=50&status=AVAILABLE|ON_DELIVERY|REST
Headers: Authorization: Bearer {{ admin_token }}
Response: 200 → { data: [ drivers ], pagination }
```

### Create Driver
```
POST /admin/drivers
Headers: Authorization: Bearer {{ admin_token }}
{
  "name": "Budi Santoso",
  "phone": "+6281234567890",
  "vehicle_info": "Motorcycle - Orange"
}
Response: 201 → { data: { id, name, phone } }
```

### Update Driver Location
```
PATCH /admin/drivers/{driver_id}/location
Headers: Authorization: Bearer {{ admin_token }}
{
  "current_latitude": -6.2250,
  "current_longitude": 106.7950
}
Response: 200 → { data: { driver_id, lat, lng, updated_at } }
```

### Get Driver's Deliveries
```
GET /admin/drivers/{driver_id}/orders?limit=20&status=ON_DELIVERY
Headers: Authorization: Bearer {{ admin_token }}
Response: 200 → { data: [ orders ] }
```

---

## 💰 ADMIN PAYMENTS (Requires admin_token)

### List Payments
```
GET /admin/payments?limit=50&status=PENDING|CONFIRMED&method=CASH|QRIS
Headers: Authorization: Bearer {{ admin_token }}
Response: 200 → { data: [ payments ], pagination }
```

### Confirm Payment (Manual)
```
PATCH /admin/payments/{payment_id}/confirm
Headers: Authorization: Bearer {{ admin_token }}
{ "notes": "Bank transfer verified" }
Response: 200 → { data: { status: "CONFIRMED", confirmed_at } }
```

### Issue Refund
```
POST /admin/payments/{payment_id}/refund
Headers: Authorization: Bearer {{ admin_token }}
{
  "reason": "Customer requested",
  "refund_amount": 23000
}
Response: 200 → { data: { refund_id, status: "PENDING" } }
```

---

## 📊 ADMIN REPORTS (Requires admin_token)

### Daily Report
```
GET /admin/reports/daily?date=2024-01-15
Headers: Authorization: Bearer {{ admin_token }}
Response: 200 → { data: { orders, revenue, breakdown } }
```

### Payment Report
```
GET /admin/reports/payments?start_date=2024-01-01&end_date=2024-01-15
Headers: Authorization: Bearer {{ admin_token }}
Response: 200 → { data: { total, by_method, by_status } }
```

---

## 🔑 STATUS CODES

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Success, no response body |
| 400 | Bad Request | Invalid request format/data |
| 401 | Unauthorized | Missing/invalid auth token |
| 403 | Forbidden | Authenticated but no permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate order, invalid transition |
| 422 | Unprocessable | Business logic error (e.g., insufficient stock) |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Internal server error |

---

## 🎯 COMMON WORKFLOWS

### Order Creation → Payment → Delivery
```
1. POST /orders → { order_id }
2. POST /orders/{order_id}/payment → { payment_id }
3. PATCH /admin/orders/{order_id}/status → CONFIRMED
4. PATCH /admin/orders/{order_id}/status → PREPARING
5. PATCH /admin/orders/{order_id}/status → READY
6. POST /admin/orders/{order_id}/assign-driver
7. PATCH /admin/drivers/{driver_id}/location (live updates)
8. PATCH /admin/orders/{order_id}/status → DELIVERED
```

### Admin Stock Management
```
1. GET /admin/menu/items → See current stock
2. PATCH /admin/menu/items/{id}/stock → Add stock
3. GET /admin/menu/items/{id}/stock-history → Audit trail
```

### Payment Verification
```
1. GET /admin/payments?status=PENDING
2. Check payment details
3. PATCH /admin/payments/{id}/confirm
4. PATCH /admin/orders/{order_id}/status → CONFIRMED
```

---

## 📌 VARIABLE SUBSTITUTION

**Use in Insomnia:**
```
{{ base_url }}           // http://localhost:3000/api/v1
{{ access_token }}       // JWT token (auto-set after login)
{{ admin_token }}        // Admin JWT token
{{ order_id }}           // Current order (auto-set)
{{ menu_item_id }}       // Current menu item
{{ category_id }}        // Current category
{{ driver_id }}          // Current driver
{{ payment_id }}         // Current payment

{{ $timestamp }}          // Current UNIX timestamp
{{ $uuid }}              // Random UUID
```

---

## ⚡ SHORTCUTS

### Quick Login
```
POST /auth/login → Sets {{ access_token }} automatically
POST /auth/login (admin) → Sets {{ admin_token }} automatically
```

### Auto ID Generation
```
POST /orders → Response sets {{ order_id }}
POST /admin/menu/items → Response sets {{ menu_item_id }}
```

### Idempotency
```
Use: Idempotency-Key: key-{{ $timestamp }}-{{ $uuid }}
Prevents duplicate orders on retry
```

---

## ✅ VALIDATION RULES

| Field | Rules |
|-------|-------|
| Email | Valid format, max 255 chars, unique |
| Password | Min 8 chars, uppercase, lowercase, number, special |
| Phone | Format +62XXXXXXXXXX, min 10 digits |
| Order Quantity | Min 0.1, max 1000, decimals OK |
| Payment Amount | Must match order.total exactly |
| Stock | Min 0, no negatives |
| Level Pedas | ORIGINAL, SEDANG, PEDAS, PEDAS_SEKALI only |
| Kuah Varian | NYEMEK, NORMAL, BANJIR only |
| Order Type | DINE_IN, TAKE_AWAY, DELIVERY only |

---

## 🆘 ERROR RESPONSES

```json
{
  "success": false,
  "status": 400,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly message",
    "details": [
      { "field": "name", "message": "Error detail" }
    ]
  }
}
```

**Common Errors:**
- `VALIDATION_ERROR` - Invalid input
- `UNAUTHORIZED` - No/invalid token
- `FORBIDDEN` - No permission
- `NOT_FOUND` - Resource doesn't exist
- `INSUFFICIENT_STOCK` - Not enough items
- `INVALID_STATUS_TRANSITION` - Can't change to that status
- `DUPLICATE_ORDER` - Idempotency key exists
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## 🔗 USEFUL LINKS

- Full API Docs: `/docs/api.md`
- Setup Guide: `/INSOMNIA-SETUP-GUIDE.md`
- Insomnia Download: https://insomnia.rest/download
- API Status: `/health` (health check endpoint)

---

**Last Updated:** January 15, 2024  
**API Version:** 1.0  
**Collection Format:** Insomnia v4

---

## 🔄 REFINEMENT v2 - TELUR, RASA & LEVEL PEDAS (UPDATED)

### Level Pedas (UPDATED - 3 options)

```
TIDAK_PEDAS  - Not spicy (NEW - was: ORIGINAL)
SEDANG       - Medium spicy (unchanged)
PEDAS        - Spicy (unchanged)
             ❌ REMOVED: PEDAS_SEKALI (extra spicy)
```

### Telur Type (NEW)

```
CEPLOK       - Fried egg (whole)
ORAK_ARIK    - Scrambled egg
```

### Rasa Type (NEW)

```
ASIN         - Salty flavored
MANIS        - Sweet flavored
```

### Updated Order Request

```json
POST /orders

{
  "order_type": "DELIVERY",
  "level_pedas": "SEDANG",        // Updated: 3 options
  "kuah_varian": "NORMAL",        // Unchanged
  "telur_type": "CEPLOK",         // NEW
  "rasa_type": "ASIN",            // NEW
  "payment_method": "QRIS",
  
  "items": [
    {"menu_item_id": "uuid", "quantity": 2}
  ],
  
  "delivery_address": "...",
  "delivery_latitude": -6.2293,
  "delivery_longitude": 106.7924,
  "customer_name": "Name",
  "customer_phone": "+628..."
}
```

### Updated Order Response

```json
{
  "success": true,
  "status": 201,
  "data": {
    "id": "uuid",
    "order_number": "ORD-20240115-ABC12",
    "order_type": "DELIVERY",
    
    "specifications": {
      "level_pedas": "SEDANG",      // Updated
      "kuah_varian": "NORMAL",
      "telur_type": "CEPLOK",       // NEW
      "rasa_type": "ASIN"           // NEW
    },
    
    "items": [...],
    "total": 23000,
    "status": "NEW"
  }
}
```

### Example: All 3 Order Types (Updated)

**DINE_IN**
```json
{
  "order_type": "DINE_IN",
  "level_pedas": "TIDAK_PEDAS",
  "kuah_varian": "NYEMEK",
  "telur_type": "CEPLOK",
  "rasa_type": "ASIN",
  "payment_method": "CASH",
  "items": [{"menu_item_id": "uuid", "quantity": 1}],
  "table_number": 3
}
```

**TAKE_AWAY**
```json
{
  "order_type": "TAKE_AWAY",
  "level_pedas": "PEDAS",
  "kuah_varian": "BANJIR",
  "telur_type": "ORAK_ARIK",
  "rasa_type": "MANIS",
  "payment_method": "CASH",
  "items": [{"menu_item_id": "uuid", "quantity": 3}],
  "pickup_time": "ASAP"
}
```

**DELIVERY**
```json
{
  "order_type": "DELIVERY",
  "level_pedas": "SEDANG",
  "kuah_varian": "NORMAL",
  "telur_type": "CEPLOK",
  "rasa_type": "ASIN",
  "payment_method": "QRIS",
  "items": [{"menu_item_id": "uuid", "quantity": 2}],
  "delivery_address": "Jl. X No. 123",
  "delivery_latitude": -6.2293,
  "delivery_longitude": 106.7924,
  "customer_name": "Name",
  "customer_phone": "+628..."
}
```

### Database Schema (Updated)

```sql
CREATE TABLE orders (
  ...
  level_pedas ENUM('TIDAK_PEDAS', 'SEDANG', 'PEDAS'),
  kuah_varian ENUM('NYEMEK', 'NORMAL', 'BANJIR'),
  telur_type ENUM('CEPLOK', 'ORAK_ARIK'),      -- NEW
  rasa_type ENUM('ASIN', 'MANIS'),             -- NEW
  ...
);
```

---

**Version:** v2 (Refinement Applied)  
**Updated:** January 15, 2024  
**Status:** ✅ All components updated
