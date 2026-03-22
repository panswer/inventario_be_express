const { Router } = require("express");
const { body } = require('express-validator');
const {
    getStocks,
    getStockById,
    getStockByProductId,
    createStock,
    updateStock,
    addStock,
    removeStock,
} = require("../controllers/stock");
const { authorizationFn } = require("../middlewares/authorization");
const { stockValidation } = require("../middlewares/stock");

const router = Router();

/**
 * @swagger
 * /api/stock:
 *  get:
 *      summary: Get all stocks
 *      description: Get all stocks with pagination, optionally filtered by warehouse
 *      tags:
 *          - Stock
 *      security:
 *          - BearerAuth: []
 *      parameters:
 *          - name: page
 *            in: query
 *            schema:
 *              type: integer
 *              default: 1
 *          - name: limit
 *            in: query
 *            schema:
 *              type: integer
 *              default: 10
 *          - name: warehouseId
 *            in: query
 *            schema:
 *              type: string
 *            description: Filter by warehouse ID
 *      responses:
 *          200:
 *              description: Get stocks success
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              stocks:
 *                                  type: array
 *                                  items:
 *                                      $ref: "#/components/schemas/StockModel"
 *                              total:
 *                                  type: integer
 */
router.get("", [authorizationFn], getStocks);

/**
 * @swagger
 * /api/stock/{stockId}:
 *  get:
 *      summary: Get stock by ID
 *      description: Get a stock entry by its ID
 *      tags:
 *          - Stock
 *      security:
 *          - BearerAuth: []
 *      parameters:
 *          - name: stockId
 *            in: path
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Get stock success
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              stock:
 *                                  $ref: "#/components/schemas/StockModel"
 */
router.get("/:stockId", [authorizationFn], getStockById);

/**
 * @swagger
 * /api/stock/product/{productId}:
 *  get:
 *      summary: Get stock by product ID
 *      description: Get stock entry for a specific product
 *      tags:
 *          - Stock
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
 *              description: Get stock success
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              stock:
 *                                  $ref: "#/components/schemas/StockModel"
 */
router.get("/product/:productId", [authorizationFn], getStockByProductId);

/**
 * @swagger
 * /api/stock:
 *  post:
 *      summary: Create a new stock entry
 *      description: Create a new stock entry for a product in a warehouse
 *      tags:
 *          - Stock
 *      security:
 *          - BearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          productId:
 *                              type: string
 *                          warehouseId:
 *                              type: string
 *                          quantity:
 *                              type: number
 *                          minQuantity:
 *                              type: number
 *                      required:
 *                          - productId
 *                          - warehouseId
 *      responses:
 *          201:
 *              description: Stock created successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              stock:
 *                                  $ref: "#/components/schemas/StockModel"
 */
router.post("", [
    authorizationFn,
    body('productId').notEmpty().withMessage('productId is required'),
    body('warehouseId').notEmpty().withMessage('warehouseId is required'),
    body('quantity').optional().isFloat({ min: 0 }).withMessage('quantity must be >= 0'),
    body('minQuantity').optional().isFloat({ min: 0 }).withMessage('minQuantity must be >= 0'),
    stockValidation,
], createStock);

/**
 * @swagger
 * /api/stock/{stockId}:
 *  put:
 *      summary: Update stock minQuantity
 *      description: Update stock minimum quantity threshold
 *      tags:
 *          - Stock
 *      security:
 *          - BearerAuth: []
 *      parameters:
 *          - name: stockId
 *            in: path
 *            required: true
 *            schema:
 *              type: string
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          minQuantity:
 *                              type: number
 *                      required:
 *                          - minQuantity
 *      responses:
 *          200:
 *              description: Stock updated successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              stock:
 *                                  $ref: "#/components/schemas/StockModel"
 */
router.put("/:stockId", [
    authorizationFn,
    body('minQuantity').isFloat({ min: 0 }).withMessage('minQuantity must be >= 0'),
    stockValidation,
], updateStock);

/**
 * @swagger
 * /api/stock/{stockId}/add:
 *  patch:
 *      summary: Add stock
 *      description: Add quantity to stock
 *      tags:
 *          - Stock
 *      security:
 *          - BearerAuth: []
 *      parameters:
 *          - name: stockId
 *            in: path
 *            required: true
 *            schema:
 *              type: string
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          amount:
 *                              type: number
 *                      required:
 *                          - amount
 *      responses:
 *          200:
 *              description: Stock added successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              stock:
 *                                  $ref: "#/components/schemas/StockModel"
 */
router.patch("/:stockId/add", [
    authorizationFn,
    body('amount').isFloat({ min: 0.01 }).withMessage('amount must be > 0'),
    stockValidation,
], addStock);

/**
 * @swagger
 * /api/stock/{stockId}/remove:
 *  patch:
 *      summary: Remove stock
 *      description: Remove quantity from stock (cannot go below 0)
 *      tags:
 *          - Stock
 *      security:
 *          - BearerAuth: []
 *      parameters:
 *          - name: stockId
 *            in: path
 *            required: true
 *            schema:
 *              type: string
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          amount:
 *                              type: number
 *                      required:
 *                          - amount
 *      responses:
 *          200:
 *              description: Stock removed successfully
 *          400:
 *              description: Insufficient stock
 */
router.patch("/:stockId/remove", [
    authorizationFn,
    body('amount').isFloat({ min: 0.01 }).withMessage('amount must be > 0'),
    stockValidation,
], removeStock);

module.exports = router;
