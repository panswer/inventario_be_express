const { Router } = require("express");
const { body } = require('express-validator');
const { transferStock, getProductStockByWarehouse } = require("../controllers/transfer");
const { authorizationFn } = require("../middlewares/authorization");
const { warehouseValidation } = require("../middlewares/warehouse");

const router = Router();

/**
 * @swagger
 * /api/transfer:
 *  post:
 *      summary: Transfer stock between warehouses
 *      description: Transfer stock from one warehouse to another
 *      tags:
 *          - Transfer
 *      security:
 *          - BearerAuth: []
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          productId:
 *                              type: string
 *                          fromWarehouseId:
 *                              type: string
 *                          toWarehouseId:
 *                              type: string
 *                          quantity:
 *                              type: number
 *                      required:
 *                          - productId
 *                          - fromWarehouseId
 *                          - toWarehouseId
 *                          - quantity
 *      responses:
 *          200:
 *              description: Transfer successful
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              fromStock:
 *                                  type: object
 *                                  $ref: '#/components/schemas/StockModel'
 *                              toStock:
 *                                  type: object
 *                                  $ref: '#/components/schemas/StockModel'
 *          400:
 *              description: Transfer failed
 */
router.post("", [
  authorizationFn,
  body('productId').notEmpty().withMessage('productId es requerido'),
  body('fromWarehouseId').notEmpty().withMessage('fromWarehouseId es requerido'),
  body('toWarehouseId').notEmpty().withMessage('toWarehouseId es requerido'),
  body('quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
  warehouseValidation
], transferStock);

/**
 * @swagger
 * /api/transfer/product/{productId}:
 *  get:
 *      summary: Get stock by product across all warehouses
 *      description: Get all stock entries for a product across all warehouses
 *      tags:
 *          - Transfer
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
 *              description: Stock by warehouse
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              stocks:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      $ref: '#/components/schemas/StockModel'
 */
router.get("/product/:productId", [authorizationFn], getProductStockByWarehouse);

module.exports = router;
