# 📁 SEBLAK PRASMANAN API - PROJECT STRUCTURE

## Folder Organization

```
seblak-api/
├── backend/                      # Node.js + Express backend
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   │   ├── database.js       # Database connection
│   │   │   ├── environment.js    # Environment variables
│   │   │   └── jwt.js            # JWT configuration
│   │   │
│   │   ├── models/              # Database models (Prisma)
│   │   │   ├── user.js
│   │   │   ├── order.js
│   │   │   ├── menuItem.js
│   │   │   └── payment.js
│   │   │
│   │   ├── services/            # Business logic
│   │   │   ├── authService.js
│   │   │   ├── orderService.js
│   │   │   ├── menuService.js
│   │   │   └── paymentService.js
│   │   │
│   │   ├── controllers/         # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── orderController.js
│   │   │   ├── menuController.js
│   │   │   └── paymentController.js
│   │   │
│   │   ├── routes/              # API routes
│   │   │   ├── auth.js
│   │   │   ├── orders.js
│   │   │   ├── menu.js
│   │   │   └── admin.js
│   │   │
│   │   ├── middleware/          # Custom middleware
│   │   │   ├── auth.js          # JWT verification
│   │   │   ├── errorHandler.js
│   │   │   └── validation.js
│   │   │
│   │   ├── utils/               # Utility functions
│   │   │   ├── logger.js
│   │   │   ├── validators.js
│   │   │   └── constants.js
│   │   │
│   │   └── app.js               # Express app setup
│   │
│   ├── prisma/
│   │   ├── schema.prisma        # Prisma data model
│   │   └── migrations/          # Database migrations
│   │
│   ├── tests/                   # Test files
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── .env                     # Environment variables (local)
│   ├── .env.example             # Template untuk .env
│   ├── package.json             # Dependencies
│   ├── server.js                # Entry point
│   └── README.md
│
├── database/                    # Database scripts
│   ├── migrations/              # SQL migration files
│   ├── seeds/                   # Sample data
│   └── schema.sql               # Full schema
│
├── docs/                        # Documentation
│   ├── API.md                   # API documentation
│   ├── SETUP.md                 # Setup guide
│   ├── DEVELOPMENT.md           # Development guide
│   └── DEPLOYMENT.md            # Deployment guide
│
├── insomnia/                    # Insomnia collection
│   └── seblak-api-collection.json
│
├── .gitignore                   # Git ignore
├── README.md                    # Project README
└── PHASES.md                    # Development phases
```

## Key Folders Explanation

### `/src` - Main application code
- **config/** - Configuration & environment setup
- **models/** - Database models definition
- **services/** - Business logic layer
- **controllers/** - HTTP request handlers
- **routes/** - API route definitions
- **middleware/** - Custom middleware (auth, validation)
- **utils/** - Helper functions & constants

### `/prisma` - Database ORM
- **schema.prisma** - Database model definitions (source of truth)
- **migrations/** - Version controlled database changes

### `/tests` - Testing
- Unit tests for individual functions
- Integration tests for services
- E2E tests for API endpoints

### `/database` - Database related
- Migration scripts (SQL)
- Seed files (sample data)
- Full schema dump

### `/docs` - Documentation
- API documentation
- Setup & development guides
- Deployment instructions
