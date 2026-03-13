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

#### Test Structure & Strategy
```
__tests__/
├── controllers/   # Mock services, test HTTP status codes
├── services/      # mongodb-memory-server (real DB)
├── middlewares/   # Mock jsonwebtoken
└── utils/         # No mocking (pure functions)
```

| Layer | Mock Strategy |
|-------|---------------|
| Utils | None (pure functions) |
| Middleware | `jest.mock("jsonwebtoken")` |
| Services | mongodb-memory-server |
| Controllers | Mock services with `jest.mock()` + `getInstance()` |

**Service Testing Notes**: Call `service.destroyInstance()` in beforeEach/afterEach. Clear collections in afterEach.

---

## Code Style

### File Structure
```
src/
├── controllers/   # Async request handlers
├── models/        # Mongoose schemas (PascalCase)
├── routes/        # Express routers
├── middlewares/   # Auth & validation
├── services/      # Business logic (singleton)
├── enums/         # Constants
├── utils/         # Utilities
├── config.js      # Environment config
├── database.js    # MongoDB connection
└── api.js         # Express setup
```

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Files | camelCase | `product.js` |
| Models | PascalCase | `Product`, `User` |
| Services | PascalCase | `ProductService.js` |
| Functions | camelCase | `getProducts` |
| Routes | lowercase | `/api/product` |

### Imports Order
```javascript
const express = require("express");           // 1. External libs
const Product = require("../models/Product"); // 2. Internal modules
const { authorizationFn } = require("../middlewares/authorization"); // 3. Middlewares
```
Order: external libs → internal modules → utils

---

## Controller Pattern

```javascript
const ProductService = require("../services/ProductService");

const getProducts = async (req, res) => {
  const { page, limit } = req.query;
  const productService = ProductService.getInstance();

  try {
    const products = await productService.getProducts(Number(page) - 1, Number(limit));
    return res.status(200).json({ products });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal error" });
  }
};

module.exports = { getProducts };
```

### Error Handling
- Use `async/await` + `try/catch`
- Log errors: `console.log(error)`
- Return consistent JSON responses with appropriate status codes

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

## Service Layer Pattern (Singleton)

```javascript
const Product = require('../models/Product');

class ProductService {
  static instance;

  static getInstance() {
    if (!this.instance) this.instance = new ProductService();
    return this.instance;
  }

  static destroyInstance() {
    delete this.instance;
  }

  getProducts(skip, limit) {
    return Product.find().skip(skip).limit(limit);
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
Middleware adds `req.body.session` with user data.

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

---

## Environment Variables
```
SERVER_PORT=3000
SERVER_JWT_SESSION_SECRET=<secret>
DB_HOST=<mongodb-uri>
DB_NAME=<database>
```

---

## Notes
- No ESLint/Prettier configured
- API docs at `/api/doc/`
- Jest configured with coverage in `jest.config.js`
