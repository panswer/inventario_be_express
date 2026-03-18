# AGENTS.md - Developer Guide

Guidelines for agents working on this codebase.

## Project Overview
- **Name**: CompraVentaBe
- **Type**: Node.js/Express REST API with MongoDB
- **Module System**: CommonJS (uses `require()`)

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
npm run test:coverage   # Coverage report (target: >90%)

# Single tests
npx jest __tests__/utils/date.test.js       # Single file
npx jest __tests__/controllers/product.test.js
npx jest --testNamePattern="getProducts"    # By test name

# Jest configuration
# - Test location: __tests__/**/*.test.js
# - Timeout: 30 seconds
# - Env: node
```

### Test Strategy
| Layer | Strategy |
|-------|----------|
| Utils | No mock (pure functions) |
| Middleware | `jest.mock("jsonwebtoken")` |
| Services | mongodb-memory-server |
| Controllers | Mock services + `getInstance()` |

**Important**: Call `service.destroyInstance()` in beforeEach/afterEach. Clear collections in afterEach.

## File Structure
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

## Code Style

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Files | camelCase | `product.js` |
| Models | PascalCase | `Product` |
| Services | PascalCase | `ProductService.js` |
| Functions | camelCase | `getProducts` |
| Routes | lowercase | `/api/product` |

### Imports Order
```javascript
// 1. External libs
const express = require("express");
// 2. Internal modules
const Product = require("../models/Product");
// 3. Middlewares
const { authorizationFn } = require("../middlewares/authorization");
```
Order: external libs → internal modules → middlewares → utils

### Controller Pattern
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
- Log errors via `LoggerService.getInstance().error()` or `.warn()`
- Return consistent JSON responses with error codes (e.g., `{ code: 2000 }`)

### Error Code Conventions
| Code | Usage |
|------|-------|
| 2000 | Product errors |
| 3000 | Price errors |
| 4000+ | Custom per-entity |

### JSDoc Pattern
```javascript
/**
 * @param {number} skip
 * @param {number} limit
 * @param {Array<string>} [categories] - Optional category filter
 * @returns {Promise<Array<Product>>}
 */
```

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

## Service Layer (Singleton)
Services use singleton pattern with `getInstance()` and `destroyInstance()`:
```javascript
class ProductService {
  static instance;
  static getInstance() {
    if (!this.instance) this.instance = new ProductService();
    return this.instance;
  }
  static destroyInstance() {
    delete this.instance;
  }
}
```

## Mongoose Models
```javascript
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
```
- Always include `createdBy` referencing the user
- Use `timestamps` for createdAt/updatedAt
- Convert dates to timestamps in toJSON
- Add Swagger JSDoc annotations for API documentation

## Authentication
Protected routes use `authorizationFn` middleware:
```javascript
router.get("", [authorizationFn], controllerFn);
// Header: Authorization: Bearer <token>
```
Middleware adds `session` to `req.body` with authenticated user data.

## Environment Variables
```
SERVER_PORT=3000
SERVER_JWT_SESSION_SECRET=<secret>
DB_HOST=<mongodb-uri>
DB_NAME=<database>
```

## Notes
- No ESLint/Prettier configured
- API docs at `/api/doc/`
- Request metadata (`requestId`, `userIp`) added by `requestLogger` middleware
- Middleware adds `session` to `req.body` with authenticated user data