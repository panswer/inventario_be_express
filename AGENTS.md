# AGENTS.md - Developer Guide

This document provides guidelines for agents working on this codebase.

## Project Overview

- **Project Name**: CompraVentaBe
- **Type**: Node.js/Express REST API with MongoDB
- **Core Functionality**: Inventory management API with authentication, products, prices, and bills

## Technology Stack

- Node.js with Express.js (v5.1.0)
- MongoDB with Mongoose ODM (v8.13.2)
- JWT for authentication
- Swagger/OpenAPI for API documentation
- Nodemon for development

---

## Commands

### Installation
```bash
npm ci
```

### Running the Application
```bash
npm run dev    # Development mode with nodemon
npm start      # Production mode with node
```

### Docker
```bash
docker-compose up -d    # Start MongoDB container
```

### Single Test
**Note**: There are currently no test frameworks configured. To add tests, consider installing Jest:
```bash
npm install --save-dev jest
```

---

## Code Style Guidelines

### File Organization
```
src/
├── controllers/    # Request handlers
├── models/          # Mongoose schemas
├── routes/         # Express routers
├── middlewares/    # Custom middleware
├── enums/          # Constants/enums
├── utils/          # Utility functions
├── config.js       # Configuration
├── database.js     # DB connection
└── api.js          # API setup
```

### Naming Conventions
- **Files**: camelCase (e.g., `product.js`, `authorization.js`)
- **Models**: PascalCase, singular (e.g., `Product`, `User`, `Bill`)
- **Variables/Functions**: camelCase
- **Routes**: RESTful, lowercase

### Imports/Requires
- Use CommonJS `require()` (project uses CommonJS, not ES modules)
- Order: external libs → internal modules → local utils
- Group imports with blank lines between groups

### Functions
- Use async/await for all asynchronous operations
- Use try/catch for error handling
- Export using `module.exports = { ... }`
- Add JSDoc comments for all exported functions

### Response Patterns
- Success: `res.status(200).json({ ... })`
- Created: `res.status(201).json({ ... })`
-res.status(400 Client errors: `).json({ message: "..." })`
- Not found: `res.status(404).json({ message: "..." })`
- Server errors: `res.status(500).json({ message: "..." })`

### Error Handling
- Always use try/catch in controllers
- Log errors appropriately (see `src/utils/color.js`)
- Return consistent error responses

### Authentication
- All protected routes use `authorizationFn` middleware
- Token passed in `Authorization: Bearer <token>` header
- JWT secret stored in `process.env.SERVER_JWT_SESSION_SECRET`

### Mongoose Models
- Use Schema with timestamps
- Define required fields with error messages
- Use refs for relationships
- Export using `model()`

### API Documentation
- Use Swagger annotations in route files
- Include schema definitions in models for swagger

---

## Common Patterns

### Controller Pattern
```javascript
const controllerFn = async (req, res) => {
  const body = req.body;
  let result;
  try {
    result = await Model.operation();
  } catch (error) {
    return res.status(400).json({ message: "Error description" });
  }
  return res.status(200).json(result);
};
```

### Middleware Pattern
```javascript
const middlewareFn = (req, res, next) => {
  if (!valid) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};
```

### Route Definition
```javascript
const router = require("express").Router();
const { controllerFn } = require("../controllers/something");
const { authorizationFn } = require("../middlewares/authorization");

router.get("", [authorizationFn], controllerFn);
module.exports = router;
```

---

## Important Files

| File | Purpose |
|------|---------|
| `index.js` | Application entry point |
| `src/config.js` | Environment configuration |
| `src/database.js` | MongoDB connection |
| `src/routes/index.js` | Main router aggregator |

---

## Environment Variables

Required in `.env`:
```
SERVER_PORT=3000
SERVER_JWT_SESSION_SECRET=<your-secret>
DB_HOST=<mongodb-connection-string>
DB_NAME=<database-name>
```

---

## Notes

- Project uses CommonJS modules (require), not ES modules
- No test framework currently set up - add one if needed
- No ESLint/Prettier configuration exists - add for better DX
- Console output uses custom color utilities from `src/utils/color.js`
- API docs available at `/api/doc/` when running
