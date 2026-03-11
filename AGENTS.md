# AGENTS.md - Developer Guide

This document provides guidelines for agents working on this codebase.

## Project Overview
- **Name**: CompraVentaBe
- **Type**: Node.js/Express REST API with MongoDB
- **Module System**: CommonJS (uses `require()`)

---

## Commands

```bash
npm ci                  # Install dependencies
npm run dev             # Dev mode (nodemon)
npm start               # Production mode
docker-compose up -d   # Start MongoDB
```

### Testing

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Generate coverage report (target: >90%)
```

#### Running Single Tests
```bash
npx jest __tests__/utils/date.test.js              # Single file
npx jest __tests__/controllers/product.test.js     # Single test file
npx jest --testNamePattern="getProducts"           # Single test by name
```

#### Test Structure
```
__tests__/
├── controllers/        # Test HTTP responses, status codes
├── services/          # Test business logic (mongodb-memory-server)
├── middlewares/       # Test auth logic (mock jwt)
└── utils/             # Test pure functions
```

#### MongoDB Memory Server Setup
Tests use `mongodb-memory-server` for real database testing:

```javascript
// jest.setup.js
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

#### Mocking Strategy

| Layer | Mock Strategy |
|-------|---------------|
| Utils | No mocking needed (pure functions) |
| Middleware | `jest.mock("jsonwebtoken")` |
| Services | mongodb-memory-server (real DB) |
| Controllers | Mock services with `jest.mock()` + `getInstance()` |
| Email | Mock `nodemailer` |
| Auth | Mock `bcrypt` + `jsonwebtoken` |

#### Service Testing Notes
- Services use mongodb-memory-server for real database operations
- Always call `service.destroyInstance()` in `beforeEach`/`afterEach`
- Clear collections in `afterEach` to ensure clean state
- Use valid enum values for coin: `$`, `Brs.`

#### Coverage Targets
- Services: 99%+ (real DB operations)
- Controllers: 90%+ (mocked services)
- Overall: 78%+ (excludes routes - requires supertest)

---

## Code Style

### File Structure
```
src/
├── controllers/    # Async request handlers
├── models/         # Mongoose schemas (PascalCase)
├── routes/         # Express routers
├── middlewares/    # Auth & validation
├── services/       # Business logic (singleton pattern)
├── enums/          # Constants
├── utils/          # Utilities
├── config.js       # Environment config
├── database.js     # MongoDB connection
└── api.js          # Express setup
```

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Files | camelCase | `product.js` |
| Models | PascalCase | `Product`, `User` |
| Services | PascalCase | `ProductService.js` |
| Enums | PascalCase | `coinEnum.js` |
| Functions | camelCase | `getProducts` |
| Routes | lowercase | `/api/product` |

### Imports
```javascript
const express = require("express");
const Product = require("../models/Product");
const ProductService = require("../services/ProductService");
const { authorizationFn } = require("../middlewares/authorization");
```
Order: external libs → internal modules → utils

---

## Controller Pattern

```javascript
const ProductService = require("../services/ProductService");

/**
 * Get products
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getProducts = async (req, res) => {
  const { page, limit } = req.query;
  const skipItems = Number(page) - 1;
  const limitNum = Number(limit);

  const productService = ProductService.getInstance();

  let products;
  try {
    products = await productService.getProducts(skipItems, limitNum);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal error" });
  }

  return res.status(200).json({ products });
};

module.exports = { getProducts };
```

### Error Handling
- Use `async/await` + `try/catch`
- Log errors: `console.log(error)`
- Return consistent JSON responses
- Validate request body/params before DB operations

### Response Status Codes
| Status | Usage |
|--------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## Service Layer Pattern

Services use the singleton pattern:

```javascript
const Product = require('../models/Product');

class ProductService {
  static instance;

  static getInstance() {
    if (!this.instance) {
      this.instance = new ProductService();
    }
    return this.instance;
  }

  static destroyInstance() {
    delete this.instance;
  }

  getProducts(skip, limit) {
    return Product.find().skip(skip).limit(limit);
  }

  getProductById(productId) {
    return Product.findById(productId);
  }

  createProduct(productData) {
    return new Product(productData).save();
  }
}

module.exports = ProductService;
```

---

## Authentication

Protected routes use `authorizationFn` middleware:
```javascript
router.get("", [authorizationFn], controllerFn);
// Header: Authorization: Bearer <token>
```
Middleware adds `req.body.session` with user data. JWT secret: `process.env.SERVER_JWT_SESSION_SECRET`

---

## Mongoose Models

```javascript
const { Schema, model } = require("mongoose");

const ProductSchema = new Schema({
  name: { type: String, required: [true, "name is required"] },
  createdBy: { type: Schema.Types.ObjectId, ref: "user", required: true },
}, {
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  toJSON: { transform: function (doc, ret) {
    ret.createdAt = doc.createdAt.getTime();
    ret.updatedAt = doc.updatedAt.getTime();
    return ret;
  }}
});

module.exports = model("product", ProductSchema);
```

- Always include `createdBy` referencing the user
- Use `timestamps` for createdAt/updatedAt
- Convert dates to timestamps in toJSON

---

## Routes

```javascript
const { Router } = require("express");
const router = Router();

router.get("", [authorizationFn], controllerFn);
router.post("", [authorizationFn], createController);
router.put("/:id", [authorizationFn], updateController);

module.exports = router;
```

- Use array for middleware: `[authorizationFn]`
- Param routes: `:paramName`
- Add `@swagger` annotations for API documentation

---

## Environment Variables
```
SERVER_PORT=3000
SERVER_JWT_SESSION_SECRET=<secret>
DB_HOST=<mongodb-uri>
DB_NAME=<database>
```

---

## Important Files
| File | Purpose |
|------|---------|
| `index.js` | Entry point |
| `src/config.js` | .env loading |
| `src/database.js` | MongoDB connection |
| `src/routes/index.js` | Main router |
| `src/utils/color.js` | Colored logging |

---

## Notes
- No ESLint/Prettier configured
- API docs at `/api/doc/`
- JWT expiry from auth service config
- Jest configured with coverage in `jest.config.js`
