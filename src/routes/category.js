const { Router } = require("express");
const { body } = require('express-validator');
const { getCategories, getCategoryById, createCategory, updateCategoryById, toggleCategory } = require("../controllers/category");
const { authorizationFn } = require("../middlewares/authorization");
const { isAdminOrManager } = require("../middlewares/roleAuthorization");
const { categoryValidation } = require("../middlewares/category");

const router = Router();

/**
 * @swagger
 * /api/category:
 *  get:
 *      summary: Get all categories
 *      description: Get all categories, optionally filter only enabled
 *      security:
 *          - BearerAuth: []
 *      tags:
 *          - Category
 *      parameters:
 *          - in: query
 *            name: onlyEnabled
 *            description: Filter only enabled categories
 *            schema:
 *              type: boolean
 *      responses:
 *          200:
 *              description: List of categories
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              categories:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      $ref: "#/components/schemas/CategoryModel"
 */
router.get("", [authorizationFn, isAdminOrManager], getCategories);

/**
 * @swagger
 * /api/category:
 *  post:
 *      summary: Create a category
 *      description: Create a new category
 *      tags:
 *          - Category
 *      security:
 *          - BearerAuth: []
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: string
 *                      required:
 *                          - name
 *      responses:
 *          201:
 *              description: Category created successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              category:
 *                                  type: object
 *                                  $ref: "#/components/schemas/CategoryModel"
 */
router.post("", [
    authorizationFn,
    isAdminOrManager,
    body('name').isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    categoryValidation
], createCategory);

/**
 * @swagger
 * /api/category/{categoryId}:
 *  get:
 *      summary: Get a category by id
 *      description: Get a category by id
 *      tags:
 *          - Category
 *      security:
 *          - BearerAuth: []
 *      parameters:
 *          - name: categoryId
 *            in: path
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Category
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              category:
 *                                  type: object
 *                                  $ref: '#/components/schemas/CategoryModel'
 */
router.get("/:categoryId", [authorizationFn, isAdminOrManager], getCategoryById);

/**
 * @swagger
 * /api/category/{categoryId}:
 *  put:
 *      summary: Update a category
 *      description: Update a category by id
 *      tags:
 *          - Category
 *      security:
 *          - BearerAuth: []
 *      parameters:
 *          - name: categoryId
 *            in: path
 *            required: true
 *            schema:
 *              type: string
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: string
 *      responses:
 *          200:
 *              description: Category updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              category:
 *                                  type: object
 *                                  $ref: '#/components/schemas/CategoryModel'
 */
router.put("/:categoryId", [
    authorizationFn,
    isAdminOrManager,
    body('name').isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    categoryValidation
], updateCategoryById);

/**
 * @swagger
 * /api/category/{categoryId}/toggle:
 *  patch:
 *      summary: Toggle category status
 *      description: Enable or disable a category
 *      tags:
 *          - Category
 *      security:
 *          - BearerAuth: []
 *      parameters:
 *          - name: categoryId
 *            in: path
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Category toggled
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              category:
 *                                  type: object
 *                                  $ref: '#/components/schemas/CategoryModel'
 */
router.patch("/:categoryId/toggle", [authorizationFn, isAdminOrManager], toggleCategory);

module.exports = router;
