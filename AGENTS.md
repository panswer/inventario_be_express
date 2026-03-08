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
No test framework configured. To add Jest:
```bash
npm install --save-dev jest
npx jest path/to/test/file.test.js         # Single test
npx jest path/to/test/file.test.js --coverage
```

---

## Code Style

### File Structure
```
src/
├── controllers/    # Async request handlers
├── models/         # Mongoose schemas (PascalCase)
├── routes/         # Express routers
├── middlewares/    # Auth & validation
├── services/       # Business logic
├── enums/          # Constants
├── utils/          # Utilities
├── config.js       # Environment config
├── database.js     # MongoDB connection
└── api.js          # Express setup
```

### Naming
| Type | Convention | Example |
|------|------------|---------|
| Files | camelCase | `product.js` |
| Models | PascalCase | `Product`, `User` |
| Functions | camelCase | `getProducts` |
| Routes | lowercase | `/api/product` |

### Imports
```javascript
const express = require("express");
const Product = require("../models/Product");
const { authorizationFn } = require("../middlewares/authorization");
```
Order: external libs → internal modules → utils

---

### Controller Pattern
```javascript
/**
 * Get products
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getProducts = async (req, res) => {
  let result;
  try {
    result = await Model.operation();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error" });
  }
  return res.status(200).json(result);
};
module.exports = { getProducts };
```

- Use `async/await` + `try/catch`
- Log errors: `console.log(error)`
- Return consistent JSON responses

### Responses
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

### Authentication
Protected routes use `authorizationFn`:
```javascript
router.get("", [authorizationFn], controllerFn);
// Header: Authorization: Bearer <token>
// JWT secret: process.env.SERVER_JWT_SESSION_SECRET
```
Middleware adds `req.body.session` with user data.

---

### Mongoose Models
```javascript
const ProductSchema = new Schema({
  name: { type: String, required: [true, "name required"] },
  createdBy: { type: Schema.Types.ObjectId, ref: "user", required: true },
}, {
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  toJSON: { transform: (doc, ret) => {
    ret.createdAt = doc.createdAt.getTime();
    ret.updatedAt = doc.updatedAt.getTime();
    return ret;
  }}
});
module.exports = model("product", ProductSchema);
```

---

### Routes
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

### Swagger
Add `@swagger` annotations in routes, schema definitions in models.

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
