# SEBLAK PRASMANAN API DOCUMENTATION

## Base URL
```
http://localhost:3000/api/v1
Production: https://api.seblakprasmanan.com/api/v1
```

## Authentication
Gunakan JWT Bearer token:
```
Authorization: Bearer <token>
```

---

## 📋 ENDPOINTS (80+)

### Authentication (6 endpoints)
```
POST   /auth/register          - Register user
POST   /auth/login             - Login
POST   /auth/refresh           - Refresh token
GET    /auth/me                - Get current user
POST   /auth/change-password   - Change password
POST   /auth/logout            - Logout
```

### Menu Management (12 endpoints)
```
GET    /menu/categories        - Get all categories
GET    /menu/categories/:id    - Get category with items
POST   /admin/menu/categories  - Create category (Admin)
PATCH  /admin/menu/categories/:id - Update category (Admin)
DELETE /admin/menu/categories/:id - Delete category (Admin)
GET    /menu/items             - Get all items
GET    /menu/items/:id         - Get item detail
POST   /admin/menu/items       - Create item (Admin)
PATCH  /admin/menu/items/:id   - Update item (Admin)
DELETE /admin/menu/items/:id   - Delete item (Admin)
PATCH  /admin/menu/items/:id/stock - Update stock (Admin)
GET    /admin/menu/low-stock   - Get low stock items (Admin)
```

### Order Management (9 endpoints)
```
POST   /orders                 - Create order
GET    /orders                 - Get user orders
GET    /orders/:id             - Get order detail
GET    /orders/:id/tracking    - Get order tracking
GET    /orders/:id/timeline    - Get order timeline
DELETE /orders/:id             - Cancel order
PATCH  /orders/:id/notes       - Add notes
POST   /orders/:orderId/items/:menuItemId/review - Review item
GET    /admin/orders/all       - Get all orders (Admin)
PATCH  /admin/orders/:id/status - Update status (Admin)
PATCH  /admin/orders/:id/assign-driver - Assign driver (Admin)
```

### Payment Management (8 endpoints)
```
GET    /payment-methods        - Get payment methods
POST   /orders/:orderId/payment - Create payment
GET    /orders/:orderId/payment - Get payment
POST   /webhooks/payment/midtrans - Midtrans webhook
POST   /webhooks/payment/ipaymu - iPaymu webhook
GET    /admin/payments/all     - Get all payments (Admin)
PATCH  /admin/payments/:id/confirm - Confirm payment (Admin)
GET    /admin/payment-stats    - Payment statistics (Admin)
```

### Dashboard & Analytics (14 endpoints)
```
GET    /admin/dashboard        - Complete dashboard
GET    /admin/dashboard/metrics - Dashboard metrics
GET    /admin/dashboard/orders - Orders overview
GET    /admin/dashboard/revenue - Revenue analytics
GET    /admin/dashboard/top-items - Top items
GET    /admin/dashboard/payment-methods - Payment distribution
GET    /admin/dashboard/order-status - Order status distribution
GET    /admin/dashboard/low-stock - Low stock alerts
GET    /admin/dashboard/customers - Customer summary
GET    /admin/analytics/sales  - Sales analytics
GET    /admin/analytics/customers - Customer analytics
GET    /admin/analytics/orders - Order analytics
GET    /admin/analytics/items  - Item analytics
GET    /admin/analytics/report - Comprehensive report
```

### User Management (9 endpoints)
```
GET    /admin/users            - Get all users
GET    /admin/users/:userId    - Get user detail
PATCH  /admin/users/:userId/profile - Update profile (Admin)
PATCH  /admin/users/:userId/role - Change role (Admin)
PATCH  /admin/users/:userId/toggle-active - Activate/deactivate (Admin)
POST   /admin/users/:userId/reset-password - Reset password (Admin)
DELETE /admin/users/:userId    - Delete user (Admin)
GET    /admin/users/stats      - User statistics (Admin)
GET    /admin/users/:userId/activity - User activity (Admin)
```

### Driver Management (10 endpoints)
```
GET    /admin/drivers          - Get all drivers
GET    /admin/drivers/stats    - Driver statistics
GET    /admin/drivers/available - Available drivers
GET    /admin/drivers/:id      - Get driver detail
POST   /admin/drivers          - Create driver (Admin)
PATCH  /admin/drivers/:id/profile - Update profile (Admin)
PATCH  /drivers/:id/location   - Update location
PATCH  /drivers/:id/status     - Update status
GET    /drivers/:id/stats      - Driver statistics
POST   /drivers/:id/ratings    - Add rating
DELETE /admin/drivers/:id      - Delete driver (Admin)
```

### Notifications (4 endpoints)
```
GET    /notifications          - Get notifications
GET    /notifications/unread-count - Unread count
PATCH  /notifications/:id/read - Mark as read
PATCH  /notifications/read-all - Mark all as read
```

### Advanced Features (6 endpoints)
```
GET    /menu/items/:id/reviews - Get item reviews
GET    /orders/:id/summary     - Get order summary
GET    /orders/export          - Export orders
GET    /admin/orders/cancellation-reasons - Cancellation analysis
```

---

## Example Requests

### Register
```
POST /auth/register
{
  "email": "customer@example.com",
  "password": "password123",
  "fullName": "Rina Wijaya",
  "phone": "+6281234567890"
}

Response (201):
{
  "success": true,
  "data": { user data },
  "tokens": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### Create Order
```
POST /orders
Headers: Authorization: Bearer <token>
{
  "orderType": "DINE_IN",
  "tableNumber": 5,
  "paymentMethod": "CASH",
  "items": [
    {
      "menuItemId": "item-uuid",
      "quantity": 2
    }
  ],
  "levelPedas": "SEDANG",
  "kuahVarian": "NORMAL"
}

Response (201): Order created
```

### Create Payment
```
POST /orders/:orderId/payment
Headers: Authorization: Bearer <token>
{
  "paymentMethod": "QRIS",
  "amount": 20000
}

Response (201): Payment created
```

### Update Order Status (Admin)
```
PATCH /admin/orders/:orderId/status
Headers: Authorization: Bearer <admin_token>
{
  "newStatus": "CONFIRMED",
  "reason": "Order confirmed by kitchen"
}

Response (200): Status updated
```

### Get Analytics
```
GET /admin/analytics/sales?startDate=2024-03-01&endDate=2024-03-10&groupBy=day
Headers: Authorization: Bearer <admin_token>

Response (200): Sales analytics data
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "status": 400,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Missing required fields"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "status": 401,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid authentication token"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "status": 403,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "status": 404,
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order not found"
  }
}
```

### 409 Conflict
```json
{
  "success": false,
  "status": 409,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "Email already registered"
  }
}
```

### 500 Server Error
```json
{
  "success": false,
  "status": 500,
  "error": {
    "code": "SERVER_ERROR",
    "message": "Internal server error"
  }
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Server Error |

---

## Order Statuses

| Status | Meaning |
|--------|---------|
| NEW | Order just created |
| CONFIRMED | Admin confirmed order |
| PREPARING | Kitchen preparing |
| READY | Order ready for pickup/delivery |
| PICKING | Driver picking up (delivery only) |
| ON_DELIVERY | Driver delivering (delivery only) |
| PICKED_UP | Customer picked up (takeaway) |
| DELIVERED | Delivered (delivery only) |
| COMPLETED | Order completed |
| CANCELLED | Order cancelled |

---

## Payment Statuses

| Status | Meaning |
|--------|---------|
| PENDING | Payment pending |
| CONFIRMED | Payment confirmed |
| FAILED | Payment failed |
| REFUNDED | Payment refunded |

---

## Payment Methods

| Method | Description |
|--------|-------------|
| CASH | Cash payment |
| QRIS | QRIS code payment |
| BANK_TRANSFER | Bank transfer |
| ONLINE | Online payment (Midtrans) |

---

## User Roles

| Role | Description |
|------|-------------|
| customer | Regular customer |
| admin | Admin/owner |
| kitchen_staff | Kitchen staff |
| driver | Delivery driver |

---

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=mysql://user:password@localhost:3306/seblak_db

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=1h
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@seblakprasmanan.com

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

---

## Rate Limiting (Future)
- 100 requests per 15 minutes per IP
- 1000 requests per hour per user

---

## Pagination

All list endpoints support pagination:
```
?limit=50&offset=0
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Testing

Run tests:
```bash
npm test
npm run test:coverage
```

---

## Deployment

```bash
# Build
npm install

# Run production
npm start

# With PM2
pm2 start server.js --name "seblak-api"
```

---

## Support

For issues or questions:
- Email: support@seblakprasmanan.com
- Issues: GitHub Issues

---

Last Updated: March 2026
API Version: v1
