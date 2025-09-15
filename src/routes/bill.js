const { Router } = require("express");
const {
  createBill,
  getAllBills,
  getBillDetailByBillId,
} = require("../controllers/bill");

const router = Router();

/**
 * @swagger
 * /api/bill:
 *  post:
 *    summary: Create a bill
 *    description: Create a bill
 *    tags:
 *      - Bill
 *    security:
 *      - BearerAuth: []
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              sellers:
 *                type: array
 *                items:
 *                  type: object
 *                  $ref: "#/components/schemas/SaleRequest"
 *            required:
 *              - sellers
 *    responses:
 *      201:
 *        description: Create a bill success
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  ok:
 *                    type: boolean
 */
router.post("", createBill);

/**
 * @swagger
 * /api/bill:
 *  get:
 *      summary: Get bills
 *      description: Get bills
 *      tags:
 *        - Bill
 *      security:
 *        - BearerAuth: []
 *      parameters:
 *        - in: query
 *          name: limit
 *          description: limit
 *          schema:
 *              type: string
 *        - in: query
 *          name: page
 *          description: page
 *          schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Get bills
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              bills:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      $ref: "#/components/schemas/BillModel"
 *                              total:
 *                                  type: number
 */
router.get("", getAllBills);

/**
 * @swagger
 * /api/bill/detail/{billId}:
 *  get:
 *      describe: Get bill detail by billId
 *      tags:
 *        - Bill
 *        - Price
 *        - Product
 *      security:
 *        - BearerAuth: []
 *      parameters:
 *        - in: path
 *          name: billId
 *          schema:
 *            type: string
 *      responses:
 *          200:
 *              describe: Get bill detail by billId success
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              billDetail:
 *                                  type: object
 *                                  $ref: '#/components/schemas/BillDetailModel'
 */
router.get("/detail/:billId", getBillDetailByBillId);

module.exports = router;
