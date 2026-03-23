const { Router } = require("express");
const { query } = require("express-validator");
const controller = require("../controllers/stockMovement");
const { authorizationFn } = require("../middlewares/authorization");
const { isAdminOrManager } = require("../middlewares/roleAuthorization");
const { stockMovementValidation } = require("../middlewares/stockMovement");

const router = Router();

/**
 * @swagger
 * /api/stock-movement:
 *  get:
 *      summary: Get all stock movements
 *      security:
 *        - BearerAuth: []
 *      tags:
 *        - Stock Movement
 *      parameters:
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *            default: 1
 *          description: Page number
 *        - in: query
 *          name: limit
 *          schema:
 *            type: integer
 *            default: 50
 *          description: Items per page
 *        - in: query
 *          name: productId
 *          schema:
 *            type: string
 *          description: Filter by product ID
 *        - in: query
 *          name: warehouseId
 *          schema:
 *            type: string
 *          description: Filter by warehouse ID
 *        - in: query
 *          name: type
 *          schema:
 *            type: string
 *            enum: [initial, in, out, adjust, transfer]
 *          description: Filter by movement type
 *        - in: query
 *          name: startDate
 *          schema:
 *            type: string
 *            format: date
 *          description: Filter movements from this date
 *        - in: query
 *          name: endDate
 *          schema:
 *            type: string
 *            format: date
 *          description: Filter movements until this date
 *      responses:
 *        200:
 *          description: Stock movements list
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  movements:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/StockMovementModel'
 *                  total:
 *                    type: integer
 */
router.get(
  "",
  [
    authorizationFn,
    isAdminOrManager,
    query("type").optional().isIn(["initial", "in", "out", "adjust", "transfer"]),
    stockMovementValidation,
  ],
  controller.getMovements
);

/**
 * @swagger
 * /api/stock-movement/product/{productId}:
 *  get:
 *      summary: Get movements for a specific product
 *      security:
 *        - BearerAuth: []
 *      tags:
 *        - Stock Movement
 *      parameters:
 *        - in: path
 *          name: productId
 *          required: true
 *          schema:
 *            type: string
 *          description: Product ID
 *        - in: query
 *          name: limit
 *          schema:
 *            type: integer
 *            default: 50
 *          description: Max number of movements
 *      responses:
 *        200:
 *          description: Product movements
 */
router.get(
  "/product/:productId",
  [authorizationFn, isAdminOrManager],
  controller.getMovementsByProduct
);

/**
 * @swagger
 * /api/stock-movement/product/{productId}/warehouse/{warehouseId}:
 *  get:
 *      summary: Get movements for a product in a specific warehouse
 *      security:
 *        - BearerAuth: []
 *      tags:
 *        - Stock Movement
 *      parameters:
 *        - in: path
 *          name: productId
 *          required: true
 *          schema:
 *            type: string
 *        - in: path
 *          name: warehouseId
 *          required: true
 *          schema:
 *            type: string
 *        - in: query
 *          name: limit
 *          schema:
 *            type: integer
 *            default: 50
 *      responses:
 *        200:
 *          description: Product warehouse movements
 */
router.get(
  "/product/:productId/warehouse/:warehouseId",
  [authorizationFn, isAdminOrManager],
  controller.getMovementsByProductAndWarehouse
);

module.exports = router;
