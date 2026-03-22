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

# Single test files
npx jest __tests__/utils/date.test.js
npx jest __tests__/controllers/product.test.js
npx jest __tests__/services/ProductService.test.js

# Run by test name pattern
npx jest --testNamePattern="getProducts"
npx jest --testNamePattern="should create" --testPathPattern="product"
```

**Test Strategy**:
| Layer | Strategy |
|-------|----------|
| Utils | No mock (pure functions) |
| Middleware | `jest.mock("jsonwebtoken")` |
| Services | mongodb-memory-server |
| Controllers | Mock services + `getInstance()` |

**Important**: Call `service.destroyInstance()` in `beforeEach`/`afterEach`. Clear collections in `afterEach`.

## File Structure
```
src/
├── controllers/   # Async request handlers (camelCase)
├── models/        # Mongoose schemas (PascalCase)
├── routes/        # Express routers (lowercase)
├── middlewares/   # Auth & validation
├── services/      # Business logic (singleton, PascalCase)
├── enums/         # Constants
├── utils/         # Utilities
├── config.js      # Environment config
├── database.js    # MongoDB connection
└── api.js         # Express setup + Swagger
__tests__/         # Mirror of src/ structure
```

## Code Style

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Files (controllers) | camelCase | `product.js` |
| Files (services) | PascalCase | `ProductService.js` |
| Files (models) | PascalCase | `Product.js` |
| Functions | camelCase | `getProducts` |
| Routes | lowercase | `/api/product` |
| Enums | camelCase | `coinEnum` |
| Enum values | camelCase | `dollar`, `bolivar` |

### Import Order
```javascript
// 1. External libs (express, mongoose, jwt, etc.)
// 2. Internal models (Product, User, etc.)
// 3. Internal services
// 4. Internal middlewares
// 5. Enums
// 6. Utils
```

### Controller Pattern
```javascript
const ProductService = require("../services/ProductService");
const LoggerService = require("../services/LoggerService");

/**
 * Get product list
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getProducts = async (req, res) => {
  const { page, limit } = req.query;
  const productService = ProductService.getInstance();
  const loggerService = LoggerService.getInstance();

  try {
    const products = await productService.getProducts(Number(page) - 1, Number(limit));
    return res.status(200).json({ products });
  } catch (error) {
    loggerService.error("productService@getProducts", {
      requestId: req.requestId,
      userIp: req.userIp,
      reason: error?.message ?? "Unknown error",
      type: "logic"
    });
    return res.status(500).json({ message: "Internal error" });
  }
};

module.exports = { getProducts };
```

### Service Layer (Singleton)
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

### Mongoose Models
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
- Always include `createdBy` referencing User
- Use `timestamps` for automatic dates
- Convert dates to timestamps in `toJSON`
- Include Swagger JSDoc annotations

**For User model**, remove password in transforms:
```javascript
toJSON: {
  transform: function (_, user) {
    delete user.password;
    return user;
  }
}
```

### Routes Definition
```javascript
router.post("", [
  authorizationFn,  // Auth first
  body('name').isLength({ min: 3 }).withMessage("Min 3 chars"),
  validationMiddleware,  // Validation last
], controllerFn);
```

### Error Handling
- Use `async/await` + `try/catch`
- Log errors via `LoggerService.getInstance().error()` or `.warn()`
- Include `requestId`, `userIp` in logs

**Error Codes**:
| Code | Entity |
|------|--------|
| 1000-1999 | User/Auth |
| 2000 | Product |
| 3000 | Price |
| 4000+ | Custom |

### Response Patterns
```javascript
// Success
return res.status(200).json({ products, total });

// Created
return res.status(201).json({ product });

// Error with code
return res.status(400).json({ code: 2000 });

// Not found
return res.status(404).json({ message: "Not found" });
```

## Authentication
Protected routes use `authorizationFn` middleware. Header: `Authorization: Bearer <token>`. Adds `session` to `req.body`.

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
- `requestLogger` middleware adds `requestId`, `userIp` to req
