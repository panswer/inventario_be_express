const { Router } = require('express');
const { query } = require('express-validator');
const controller = require('../controllers/report');
const { authorizationFn } = require('../middlewares/authorization');

const router = Router();

/**
 * @swagger
 * /api/report/movements:
 *  get:
 *      summary: Generate movements history report (XLSX)
 *      security:
 *        - BearerAuth: []
 *      tags:
 *        - Reports
 *      parameters:
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
 *            format: date-time
 *          description: Start date (ISO string)
 *        - in: query
 *          name: endDate
 *          schema:
 *            type: string
 *            format: date-time
 *          description: End date (ISO string)
 *      responses:
 *        200:
 *          description: XLSX file
 *          content:
 *            application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *              schema:
 *                type: string
 *                format: binary
 */
router.get(
  '/movements',
  [authorizationFn, query('type').optional().isIn(['initial', 'in', 'out', 'adjust', 'transfer'])],
  controller.getMovementsReport
);

/**
 * @swagger
 * /api/report/movements/summary:
 *  get:
 *      summary: Generate movements summary report (XLSX)
 *      security:
 *        - BearerAuth: []
 *      tags:
 *        - Reports
 *      parameters:
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
 *          name: startDate
 *          schema:
 *            type: string
 *            format: date-time
 *          description: Start date (ISO string)
 *        - in: query
 *          name: endDate
 *          schema:
 *            type: string
 *            format: date-time
 *          description: End date (ISO string)
 *      responses:
 *        200:
 *          description: XLSX file
 *          content:
 *            application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *              schema:
 *                type: string
 *                format: binary
 */
router.get('/movements/summary', [authorizationFn], controller.getSummaryReport);

/**
 * @swagger
 * /api/report/movements/transfers:
 *  get:
 *      summary: Generate transfers report (XLSX)
 *      security:
 *        - BearerAuth: []
 *      tags:
 *        - Reports
 *      parameters:
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
 *          name: startDate
 *          schema:
 *            type: string
 *            format: date-time
 *          description: Start date (ISO string)
 *        - in: query
 *          name: endDate
 *          schema:
 *            type: string
 *            format: date-time
 *          description: End date (ISO string)
 *      responses:
 *        200:
 *          description: XLSX file
 *          content:
 *            application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *              schema:
 *                type: string
 *                format: binary
 */
router.get('/movements/transfers', [authorizationFn], controller.getTransfersReport);

module.exports = router;
