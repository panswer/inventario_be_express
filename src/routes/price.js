const { Router } = require("express");
const {
  getPriceCoinAll,
  getPriceByProductId,
  updatePriceById,
} = require("../controllers/price");
const { authorizationFn } = require("../middlewares/authorization");

const router = Router();

/**
 * @swagger
 * /api/price/coin:
 *  get:
 *      summary: Get all price coin
 *      description: Get all price coin
 *      tags:
 *          - Price
 *      security:
 *          - BearerAuth: []
 *      responses:
 *          200:
 *              description: Get price coins
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              coins:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      $ref: "#/components/schemas/CoinType"
 */
router.get("/coin", getPriceCoinAll);

/**
 * @swagger
 * /api/price/product/{productId}:
 *  get:
 *      summary: Get a price by productId
 *      description: Get a price by productId
 *      tags:
 *          - Price
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
 *              description: Get a price by productId success
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              price:
 *                                  type: object
 *                                  $ref: "#/components/schemas/PriceModel"
 */
router.get("/product/:productId", [authorizationFn], getPriceByProductId);

/**
 * @swagger
 * /api/price/{priceId}/{coin}:
 *  put:
 *    summary: Update a price by id
 *    description: Update a price by id
 *    tags:
 *      - Price
 *    security:
 *      - BearerAuth: []
 *    parameters:
 *      - name: priceId
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *      - name: coin
 *        in: path
 *        required: true
 *        schema:
 *          type: "#/components/schemas/CoinType"
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              amount:
 *                type: number
 *    responses:
 *      202:
 *        description: Update a price by id success
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                price:
 *                  type: object
 *                  $ref: "#/components/schemas/PriceModel"
 */
router.put("/:priceId/:coin", [authorizationFn], updatePriceById);

module.exports = router;
