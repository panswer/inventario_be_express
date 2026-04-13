const { Router } = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  createProduct,
  updateProductById,
  getProductById,
  getProductByBarcode,
} = require('../controllers/product');
const { authorizationFn } = require('../middlewares/authorization');
const { isAdminOrManager, isCashierOrHigher } = require('../middlewares/roleAuthorization');
const { productValidation, productBarcodeValidation } = require('../middlewares/product');
const { validateCategories } = require('../middlewares/category');
const { imageValidation } = require('../middlewares/imageValidation');
const { coinEnum } = require('../enums/coinEnum');

const router = Router();

/**
 * @swagger
 * /api/product:
 *  get:
 *      summary: Get all products
 *      description: Get all products with page and limit, optionally filtered by categories and warehouse
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
 *          - in: query
 *            name: warehouseId
 *            description: Filter by warehouse ID to include stock info. If not provided, uses user's assigned warehouse
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
 *                                      properties:
 *                                          _id:
 *                                              type: string
 *                                          name:
 *                                              type: string
 *                                          barcode:
 *                                              type: string
 *                                          inStock:
 *                                              type: boolean
 *                                          image:
 *                                              type: string
 *                                          categories:
 *                                              type: array
 *                                          createdBy:
 *                                              type: string
 *                                          createdAt:
 *                                              type: integer
 *                                          updatedAt:
 *                                              type: integer
 *                                          stock:
 *                                              type: object
 *                                              properties:
 *                                                  quantity:
 *                                                      type: number
 *                                                  minQuantity:
 *                                                      type: number
 *                              total:
 *                                  type: number
 */
router.get('', [authorizationFn, isCashierOrHigher], getProducts);

/**
 * @swagger
 * /api/product/barcode/{barcode}:
 *  get:
 *      summary: Get a product by barcode
 *      description: Get a product and its current price by barcode
 *      tags:
 *          - Product
 *      security:
 *          - BearerAuth: []
 *      parameters:
 *          - name: barcode
 *            in: path
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Product and price
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              product:
 *                                  type: object
 *                                  $ref: '#/components/schemas/ProductModel'
 *                              price:
 *                                  type: object
 *                                  $ref: '#/components/schemas/PriceModel'
 *          404:
 *              description: Product not found
 */
router.get('/barcode/:barcode', [authorizationFn, isCashierOrHigher], getProductByBarcode);

/**
 * @swagger
 * /api/product:
 *  post:
 *      summary: Create a product and price
 *      description: Create a product and price with optional image
 *      tags:
 *          - Product
 *          - Price
 *      security:
 *          - BearerAuth: []
 *      requestBody:
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: string
 *                          barcode:
 *                              type: string
 *                              description: Product barcode (optional)
 *                          amount:
 *                              type: number
 *                          coin:
 *                              type: string
 *                              $ref: "#/components/schemas/CoinType"
 *                          categories:
 *                              type: array
 *                              items:
 *                                  type: string
 *                          image:
 *                              type: string
 *                              format: binary
 *                              description: Product image (jpg, jpeg, svg - max 2MB)
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
router.post(
  '',
  [
    authorizationFn,
    isAdminOrManager,
    body('amount').isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor a 0.01'),
    body('coin').isIn(Object.values(coinEnum)).withMessage('La moneda no es válida'),
    body('name').isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
    productBarcodeValidation,
    productValidation,
    validateCategories,
    imageValidation,
  ],
  createProduct
);

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
router.get('/:productId', [authorizationFn, isCashierOrHigher], getProductById);

/**
 * @swagger
 * /api/product/{productId}:
 *  put:
 *      summary: Update a product
 *      description: Update a product by id with optional image
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
 *              multipart/form-data:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          inStock:
 *                              type: boolean
 *                          name:
 *                              type: string
 *                          barcode:
 *                              type: string
 *                          categories:
 *                              type: array
 *                              items:
 *                                  type: string
 *                          image:
 *                              type: string
 *                              format: binary
 *                              description: Product image (jpg, jpeg, svg - max 2MB)
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
router.put(
  '/:productId',
  [
    authorizationFn,
    isAdminOrManager,
    body('name').isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
    productBarcodeValidation,
    productValidation,
    validateCategories,
    imageValidation,
  ],
  updateProductById
);

module.exports = router;
