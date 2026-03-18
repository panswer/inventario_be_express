const { Router } = require("express");
const { body } = require('express-validator');
const { getProducts, createProduct, updateProductById, getProductById } = require("../controllers/product");
const { authorizationFn } = require("../middlewares/authorization");
const { productValidation } = require("../middlewares/product");
const { validateCategories } = require("../middlewares/category");
const { coinEnum } = require("../enums/coinEnum");

const router = Router();

/**
 * @swagger
 * /api/product:
 *  get:
 *      summary: Get all products
 *      description: Get all products with page and limit, optionally filtered by categories
 *      security:
 *          - BearerAuth: []
 *      tags:
 *          - Product
 *      parameters:
 *          - in: query
 *            name: page
 *            description: The page number
 *            schema:
 *              type: integer
 *          - in: query
 *            name: limit
 *            description: How many items will be return
 *            schema:
 *              type: integer
 *          - in: query
 *            name: categories
 *            description: Comma-separated category IDs to filter by (AND logic)
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: list of product and total
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              products:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      $ref: "#/components/schemas/ProductModel"
 *                              total:
 *                                  type: number
 */
router.get("", [authorizationFn], getProducts);

/**
 * @swagger
 * /api/product:
 *  post:
 *      summary: Create a product and price
 *      description: Create a product and price
 *      tags:
 *          - Product
 *          - Price
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
 *                          amount:
 *                              type: number
 *                          coin:
 *                              type: string
 *                              $ref: "#/components/schemas/CoinType"
 *                          categories:
 *                              type: array
 *                              items:
 *                                  type: string
 *                      required:
 *                          - name
 *                          - amount
 *                          - coin
 *      responses:
 *          201:
 *              description: Product and Prices created success
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              product:
 *                                  type: object
 *                                  $ref: "#/components/schemas/ProductModel"
 *                              price:
 *                                  type: object
 *                                  $ref: "#/components/schemas/PriceModel"
 *                          required:
 *                              - product
 *                              - price
 */
router.post("", [
    authorizationFn,
    body('amount').isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor a 0.01'),
    body('coin').isIn(Object.values(coinEnum)).withMessage('La moneda no es válida'),
    body('name').isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
    productValidation,
    validateCategories
], createProduct);

/**
 * @swagger
 * /api/product/{productId}:
 *  get:
 *      summary: Get a product by id
 *      description: Get a product by id
 *      tags:
 *          - Product
 *      security:
 *          - BearerAuth: []
 *      parameters:
 *          - name: productId
 *            in: path
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Product
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              product:
 *                                  type: object
 *                                  $ref: '#/components/schemas/ProductModel'
 */
router.get("/:productId", [authorizationFn], getProductById);

/**
 * @swagger
 * /api/product/{productId}:
 *  put:
 *      summary: Update a product
 *      description: Update a product by id
 *      tags:
 *          - Product
 *      security:
 *          - BearerAuth: []
 *      parameters:
 *          - name: productId
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
 *                          inStock:
 *                              type: boolean
 *                          name:
 *                              type: string
 *                          categories:
 *                              type: array
 *                              items:
 *                                  type: string
 *      responses:
 *          202:
 *              description: Product updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              product:
 *                                  type: object
 *                                  $ref: '#/components/schemas/ProductModel'
 */
router.put("/:productId", [
    authorizationFn,
    body('name').isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
    productValidation,
    validateCategories
], updateProductById);

module.exports = router;
