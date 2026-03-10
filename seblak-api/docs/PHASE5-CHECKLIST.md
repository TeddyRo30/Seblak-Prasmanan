# 🚀 PHASE 5: BACKEND DEVELOPMENT - DETAILED CHECKLIST

**Duration:** 3-4 weeks (incremental)  
**Status:** 🔴 STARTING NOW  
**Approach:** Step-by-step, no rushing

---

## 📋 PHASE 5 BREAKDOWN

```
WEEK 1: Foundation Setup
├─ Day 1: Project setup & dependencies
├─ Day 2: Database setup & Prisma
├─ Day 3: Express app & middleware
└─ Day 4: Authentication system

WEEK 2: Core Features Part 1
├─ Day 5: Menu endpoints
├─ Day 6: Order creation (DINE_IN)
├─ Day 7: Order creation (TAKE_AWAY)
└─ Day 8: Order creation (DELIVERY)

WEEK 3: Core Features Part 2
├─ Day 9: Order management
├─ Day 10: Payment handling
├─ Day 11: Admin dashboard
└─ Day 12: Delivery management

WEEK 4: Polish & Testing
├─ Day 13: Error handling & validation
├─ Day 14: Testing (unit & integration)
├─ Day 15: Documentation
└─ Day 16: Bug fixes & optimization
```

---

## ✅ WEEK 1: FOUNDATION SETUP

### Day 1: Project Initialization & Dependencies

#### Step 1.1: Initialize Node.js Project
```bash
cd /home/claude/seblak-api/backend
npm init -y
```

#### Step 1.2: Install Base Dependencies
```bash
npm install express cors dotenv helmet
npm install prisma @prisma/client
npm install bcryptjs jsonwebtoken
npm install mysql2
npm install --save-dev nodemon
```

#### Step 1.3: Create folder structure
```bash
mkdir -p src/{config,models,services,controllers,routes,middleware,utils}
mkdir -p prisma/migrations
mkdir -p tests/{unit,integration,e2e}
mkdir -p database/{migrations,seeds}
```

#### ✅ Deliverable
- `package.json` dengan semua dependencies
- Folder structure lengkap
- Ready untuk next step

### Day 2: Database Setup & Prisma

#### Step 2.1: Create `.env` file
```bash
DATABASE_URL="mysql://user:password@localhost:3306/seblak_db"
JWT_SECRET="your-secret-key-here-change-in-production"
NODE_ENV="development"
PORT=3000
```

#### Step 2.2: Initialize Prisma
```bash
npx prisma init
```

#### Step 2.3: Create Prisma Schema
Lihat SCHEMA_PRISMA.md yang akan saya buat

#### Step 2.4: Run migrations
```bash
npx prisma migrate dev --name init
```

#### ✅ Deliverable
- Database connected
- Prisma models ready
- Tables created in database

### Day 3: Express App & Middleware

#### Step 3.1: Create `src/app.js`
Setup Express application dengan middleware

#### Step 3.2: Create `src/middleware/errorHandler.js`
Global error handling middleware

#### Step 3.3: Create `src/middleware/auth.js`
JWT authentication middleware

#### Step 3.4: Create `server.js`
Entry point untuk application

#### ✅ Deliverable
- Express app running di localhost:3000
- Middleware configured
- Error handling setup

### Day 4: Authentication System

#### Step 4.1: Create `src/services/authService.js`
Register, login, refresh token logic

#### Step 4.2: Create `src/controllers/authController.js`
Handle auth requests

#### Step 4.3: Create `src/routes/auth.js`
Auth endpoints setup

#### ✅ Deliverable
- User registration working
- User login working
- JWT tokens generated & verified
- Test di Insomnia: Register → Login → Refresh Token

---

## ✅ WEEK 2: CORE FEATURES PART 1

### Day 5: Menu Endpoints

#### Step 5.1: Create `src/services/menuService.js`
Get categories, items, search logic

#### Step 5.2: Create `src/controllers/menuController.js`
Handle menu requests

#### Step 5.3: Create `src/routes/menu.js`
Menu endpoints (public)

#### ✅ Deliverable
- GET /menu/categories working
- GET /menu/categories/:id/items working
- GET /menu/items/:id working
- Test di Insomnia: Get all data

### Day 6: Order Creation - DINE_IN

#### Step 6.1: Create order specifications validator
Validate level_pedas, kuah_varian, telur_type, rasa_type

#### Step 6.2: Create DINE_IN order creation logic
Handle table_number, kasir input

#### Step 6.3: Create `src/controllers/orderController.js`
POST /orders endpoint

#### ✅ Deliverable
- Create DINE_IN order working
- Validation for specifications
- Order saved to database
- Test di Insomnia: Create DINE_IN Order

### Day 7: Order Creation - TAKE_AWAY

#### Step 7.1: Add TAKE_AWAY logic
Handle pickup_time, customer_name, customer_phone

#### Step 7.2: Validation untuk TAKE_AWAY
Ensure required fields present

#### ✅ Deliverable
- Create TAKE_AWAY order working
- Pickup time logic
- Test di Insomnia: Create TAKE_AWAY Order

### Day 8: Order Creation - DELIVERY

#### Step 8.1: Add DELIVERY logic
Handle delivery_address, coordinates, delivery_time

#### Step 8.2: Calculate delivery fee
Distance based calculation

#### Step 8.3: Validation untuk DELIVERY
Address & location validation

#### ✅ Deliverable
- Create DELIVERY order working
- Delivery fee calculated
- Test di Insomnia: Create DELIVERY Order

---

## ✅ WEEK 3: CORE FEATURES PART 2

### Day 9: Order Management

#### Step 9.1: Implement order listing
GET /orders (customer's orders)

#### Step 9.2: Implement order detail
GET /orders/:id (with all details)

#### Step 9.3: Implement order tracking
GET /orders/:id/tracking (live tracking)

#### ✅ Deliverable
- List orders working
- Order detail complete
- Tracking endpoint ready
- Test di Insomnia: All order GET endpoints

### Day 10: Payment Handling

#### Step 10.1: Create payment service
Create payment, handle different methods

#### Step 10.2: Create payment controller
POST /orders/:id/payment endpoint

#### Step 10.3: Payment validation
Amount matching, method validation

#### ✅ Deliverable
- Create payment working
- All payment methods supported (CASH, QRIS, TRANSFER, ONLINE)
- Test di Insomnia: Create Payment

### Day 11: Admin Dashboard

#### Step 11.1: Create admin auth
Separate login untuk admin

#### Step 11.2: Create dashboard service
Get metrics, orders, inventory

#### Step 11.3: Create dashboard controller
GET /admin/dashboard endpoint

#### ✅ Deliverable
- Admin login working
- Dashboard metrics ready
- Can see pending orders
- Test di Insomnia: Admin Login → Dashboard

### Day 12: Delivery Management

#### Step 12.1: Create driver service
List, add, update driver

#### Step 12.2: Create driver controller
Driver endpoints

#### Step 12.3: Assign driver logic
Link driver to delivery order

#### ✅ Deliverable
- Can add drivers
- Can assign to orders
- Location tracking setup
- Test di Insomnia: Driver management endpoints

---

## ✅ WEEK 4: POLISH & TESTING

### Day 13: Error Handling & Validation

#### Step 13.1: Comprehensive error handling
All error cases covered

#### Step 13.2: Input validation
All inputs validated

#### Step 13.3: Error response standardization
Consistent error format

#### ✅ Deliverable
- No unhandled errors
- Validation for all inputs
- Standard error responses

### Day 14: Testing

#### Step 14.1: Unit tests
Test services & utilities

#### Step 14.2: Integration tests
Test API endpoints

#### ✅ Deliverable
- 50+ test cases passing
- Coverage for main features
- No critical bugs

### Day 15: Documentation

#### Step 15.1: API documentation
Complete endpoint docs

#### Step 15.2: Setup guide
How to run locally

#### Step 15.3: Database documentation
Schema & migrations

#### ✅ Deliverable
- Comprehensive documentation
- Setup guide complete
- Easy for others to understand

### Day 16: Bug Fixes & Optimization

#### Step 16.1: Fix any remaining bugs
Test thoroughly

#### Step 16.2: Performance optimization
Optimize queries & response times

#### Step 16.3: Code cleanup
Remove debug code, improve readability

#### ✅ Deliverable
- All bugs fixed
- Performance optimized
- Production ready code

---

## 🎯 STARTING POINT: WHAT WE'LL DO TODAY

### Today's Goal: Day 1 - Project Initialization

**What we'll create:**
1. ✅ package.json (done below)
2. ✅ Folder structure
3. ✅ Base dependencies installed
4. ✅ Ready for Day 2

**Time:** ~30 minutes

**What you'll need:**
- Node.js installed (check with `node --version`)
- npm installed (check with `npm --version`)
- Code editor (VS Code recommended)
- MySQL installed locally OR we'll use in-memory for testing

---

## 📊 PROGRESS TRACKING

```
Week 1: Foundation          [ ][ ][ ][ ]
Week 2: Core Features 1     [ ][ ][ ][ ]
Week 3: Core Features 2     [ ][ ][ ][ ]
Week 4: Polish & Testing    [ ][ ][ ][ ]

Total: 16 Days of focused development
Estimated: 3-4 weeks (part-time)
```

---

## 🔗 REFERENCE MATERIALS

**You already have:**
- ✅ API-QUICK-REFERENCE.md (for what to code)
- ✅ REFINEMENT-TELUR-RASA-PEDAS.md (for specifics)
- ✅ seblak-api-insomnia-collection.json (for testing)

**I'll create:**
- ✅ SCHEMA_PRISMA.md (Prisma schema)
- ✅ DAY1_SETUP.md (Today's detailed guide)
- ✅ CODE_EXAMPLES.md (Copy-paste ready code)

---

## ⚠️ IMPORTANT NOTES

1. **Go slow** - Better to understand than to rush
2. **Test as you go** - Test each endpoint with Insomnia
3. **Ask questions** - If anything unclear, ask
4. **Commit regularly** - Use git to track progress
5. **Take breaks** - Pace yourself

---

## 🚀 READY TO START?

Say "Yes" and I will:
1. Guide you step-by-step through Day 1
2. Create all necessary files
3. Explain each step
4. Help with any issues

**Or** if you have questions about the plan, ask now!

---

**Current Status:** 🟡 WAITING FOR YOUR GO-AHEAD

Next: I'll help you through Day 1 setup step-by-step.
