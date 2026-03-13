# SEBLAK PRASMANAN BACKEND - SETUP & DEPLOYMENT GUIDE

## 📋 TABLE OF CONTENTS
1. Project Overview
2. Tech Stack
3. Database Schema
4. Installation
5. Configuration
6. Running Development Server
7. Testing
8. Deployment
9. API Endpoints
10. Troubleshooting

---

## 🎯 PROJECT OVERVIEW

**Seblak Prasmanan** adalah aplikasi food ordering untuk restoran Seblak dengan:
- ✅ Customer app untuk order
- ✅ Admin dashboard untuk management
- ✅ Driver app untuk delivery
- ✅ Real-time order tracking
- ✅ Multiple payment methods
- ✅ Analytics & reporting

**Status:** MVP Ready (Production)
**Backend:** 100% Complete (80+ endpoints)
**Total Development:** 16 days

---

## 🛠️ TECH STACK

```
Backend Framework    : Node.js + Express.js
Database            : MySQL
ORM                 : Prisma v5.7.1
Authentication      : JWT (jsonwebtoken)
Password Hashing    : bcryptjs
Email               : Nodemailer (SMTP)
Validation          : Custom middleware
Testing             : Jest + Supertest
API Documentation   : Markdown
Deployment          : Docker/PM2 (optional)
```

---

## 📊 DATABASE SCHEMA (13 TABLES)

```
Users (Customers, Admin, Drivers, Kitchen Staff)
├── Addresses
├── Orders
│   ├── OrderItems
│   ├── OrderStatusHistory
│   └── ItemReview
├── MenuCategories
│   └── MenuItems
│       ├── ItemStock
│       ├── ItemReview
│       └── Inventory
├── Payments
│   └── PaymentTransactions
├── Drivers (extending Users)
│   └── DriverRating
├── Notifications
└── ActivityLog
```

---

## 💻 INSTALLATION

### Prerequisites
```
Node.js v18+
MySQL 8.0+
npm or yarn
```

### Step 1: Clone & Install
```bash
cd seblak-api/backend
npm install
```

### Step 2: Setup Database
```bash
# Create database
mysql -u root -p
CREATE DATABASE seblak_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Step 3: Configure Prisma
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### Step 4: Configure Environment
```bash
cp .env.example .env
# Edit .env dengan konfigurasi lokal
```

---

## ⚙️ CONFIGURATION (.env)

```env
# Server Config
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=mysql://root:password@localhost:3306/seblak_db

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars_long!
JWT_EXPIRE=1h
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars_long!
JWT_REFRESH_EXPIRE=7d

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
SMTP_FROM=noreply@seblakprasmanan.com

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Payment Gateways (optional)
MIDTRANS_SERVER_KEY=your_midtrans_key
IPAYMU_API_KEY=your_ipaymu_key
```

**Note:** Untuk Gmail:
1. Enable 2-Factor Authentication
2. Go to: https://myaccount.google.com/apppasswords
3. Generate app password
4. Use sebagai SMTP_PASSWORD

---

## 🚀 RUNNING DEVELOPMENT SERVER

### Start Server
```bash
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:3000
✅ Database connected
📊 API ready for requests
```

### Test Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "success": true,
  "status": "healthy",
  "uptime": 2.5
}
```

---

## 🧪 TESTING

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Example Test Output
```
PASS  src/__tests__/auth.test.js
  Authentication API
    ✓ should register new user (45ms)
    ✓ should reject duplicate email (32ms)
    ✓ should login successfully (51ms)
    ✓ should reject invalid credentials (38ms)

PASS  src/__tests__/order.test.js
  Order API
    ✓ should create order (78ms)
    ✓ should get order detail (42ms)
    ✓ should cancel order (55ms)

Tests: 15 passed, 15 total
Coverage: 85%
```

---

## 📦 DEPLOYMENT

### Option 1: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "server.js"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: seblak_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: mysql://root:password@db:3306/seblak_db
    depends_on:
      - db

volumes:
  mysql_data:
```

Run:
```bash
docker-compose up -d
```

---

### Option 2: PM2 Deployment

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem config
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'seblak-api',
      script: './server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 'max',
      exec_mode: 'cluster'
    }
  ]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs
```

---

### Option 3: Vercel/Heroku Deployment

For Vercel, create `vercel.json`:
```json
{
  "buildCommand": "npm install && npx prisma generate",
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

Then push to Vercel:
```bash
vercel deploy --prod
```

---

## 📊 FOLDER STRUCTURE

```
backend/
├── server.js                    # Entry point
├── src/
│   ├── app.js                   # Express app setup
│   ├── middleware/
│   │   └── auth.js              # JWT auth middleware
│   ├── services/               # Business logic
│   │   ├── authService.js
│   │   ├── menuService.js
│   │   ├── orderService.js
│   │   ├── paymentService.js
│   │   ├── dashboardService.js
│   │   ├── userService.js
│   │   ├── driverService.js
│   │   ├── advancedOrderService.js
│   │   ├── notificationService.js
│   │   └── analyticsService.js
│   ├── controllers/             # Request handlers
│   │   ├── authController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── dashboardController.js
│   │   ├── userController.js
│   │   ├── driverController.js
│   │   ├── advancedOrderController.js
│   │   ├── notificationController.js
│   │   └── analyticsController.js
│   ├── routes/                  # Route definitions
│   │   ├── auth.js
│   │   ├── menu.js
│   │   ├── order.js
│   │   ├── payment.js
│   │   ├── dashboard.js
│   │   ├── user.js
│   │   ├── driver.js
│   │   └── notification.js
│   └── __tests__/               # Tests
│       ├── auth.test.js
│       ├── order.test.js
│       └── payment.test.js
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Migration files
├── package.json
├── jest.config.js
├── .env.example
└── .env                         # Local config (git ignored)
```

---

## 🔌 API ENDPOINTS SUMMARY

**Total: 80+ Endpoints**

### By Category
- Authentication: 6 endpoints
- Menu Management: 12 endpoints
- Order Management: 11 endpoints
- Payment Processing: 8 endpoints
- Dashboard: 9 endpoints
- Analytics: 5 endpoints
- User Management: 9 endpoints
- Driver Management: 10 endpoints
- Notifications: 4 endpoints
- Advanced Features: 6 endpoints

See `API_DOCUMENTATION.md` untuk complete list dengan contoh.

---

## 🐛 TROUBLESHOOTING

### Database Connection Error
```
Error: Can't reach database server
```

Fix:
```bash
# Check MySQL is running
mysql -u root -p

# Check DATABASE_URL in .env
echo $DATABASE_URL

# Re-run migration
npx prisma migrate dev
```

---

### JWT Token Error
```
Error: Invalid authentication token
```

Fix:
```bash
# Check JWT_SECRET is set in .env
# Re-generate token by login again
POST /api/v1/auth/login
```

---

### Email Not Sending
```
Error: Email transporter error
```

Fix:
```bash
# Check SMTP credentials in .env
# Verify Gmail app password created
# Check SMTP settings:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

---

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```

Fix:
```bash
# Change port in .env
PORT=3001

# Or kill process:
lsof -ti:3000 | xargs kill -9
```

---

## 📈 PERFORMANCE TIPS

1. **Database**: Add indexes untuk frequently queried fields
2. **Caching**: Implementasi Redis untuk menu cache
3. **Rate Limiting**: Tambahkan express-rate-limit
4. **Compression**: Use gzip middleware
5. **Monitoring**: Setup PM2 monitoring

---

## 🔒 SECURITY CHECKLIST

- ✅ JWT tokens implemented
- ✅ Password hashing (bcryptjs)
- ✅ Input validation
- ✅ CORS configured
- ✅ Error handling (no sensitive data)
- ✅ SQL injection prevention (Prisma ORM)
- ⚠️ TODO: Rate limiting
- ⚠️ TODO: HTTPS only in production
- ⚠️ TODO: API key for webhooks
- ⚠️ TODO: Request signing for payment webhooks

---

## 📞 SUPPORT & MAINTENANCE

### Regular Tasks
- Monitor error logs
- Update dependencies: `npm update`
- Backup database regularly
- Review analytics monthly
- Update security patches

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Secure JWT_SECRET
- [ ] Enable HTTPS
- [ ] Setup monitoring
- [ ] Configure backups
- [ ] Setup CI/CD pipeline
- [ ] Document deployment procedure
- [ ] Monitor performance metrics

---

## 📄 LICENSE & CREDITS

Built with ❤️ for Seblak Prasmanan
Version 1.0.0 - MVP Release

---

## 🚀 NEXT STEPS

1. ✅ Backend complete
2. → Build Frontend (Next.js + React)
3. → Integrate payment gateways
4. → Setup monitoring (Sentry, DataDog)
5. → Deploy to production

---

**For detailed API documentation, see:** `API_DOCUMENTATION.md`
**For frontend integration guide, see:** `FRONTEND_INTEGRATION.md` (akan dibuat)

Last Updated: March 2026
