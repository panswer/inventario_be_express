const { Router } = require("express");
const { body } = require('express-validator');
const {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} = require("../controllers/warehouse");
const { authorizationFn } = require("../middlewares/authorization");
const { isAdminOrManager } = require("../middlewares/roleAuthorization");
const { warehouseValidation } = require("../middlewares/warehouse");

const router = Router();

/**
 * @swagger
 * /api/warehouse:
 *  get:
 *      summary: Get all warehouses
 *      description: Get all warehouses with pagination
 *      security:
 *          - BearerAuth: []
 *      tags:
 *          - Warehouse
 *      parameters:
 *          - in: query
 *            name: page
 *            description: The page number
 *            schema:
 *              type: integer
 *          - in: query
 *            name: limit
 *            description: How many items will be returned
 *            schema:
 *              type: integer
 *      responses:
 *          200:
 *              description: List of warehouses and total
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              warehouses:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      $ref: "#/components/schemas/WarehouseModel"
 *                              total:
 *                                  type: number
 */
router.get("", [authorizationFn, isAdminOrManager], getWarehouses);

/**
 * @swagger
 * /api/warehouse/{warehouseId}:
 *  get:
 *      summary: Get a warehouse by id
 *      description: Get a warehouse by id
 *      tags:
 *          - Warehouse
 *      security:
 *          - BearerAuth: []
 *      parameters:
 *          - name: warehouseId
 *            in: path
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Warehouse
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              warehouse:
 *                                  type: object
 *                                  $ref: '#/components/schemas/WarehouseModel'
 */
router.get("/:warehouseId", [authorizationFn, isAdminOrManager], getWarehouseById);

/**
 * @swagger
 * /api/warehouse:
 *  post:
 *      summary: Create a warehouse
 *      description: Create a new warehouse
 *      tags:
 *          - Warehouse
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
 *                          address:
 *                              type: string
 *                      required:
 *                          - name
 *                          - address
 *      responses:
 *          201:
 *              description: Warehouse created successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              warehouse:
 *                                  type: object
 *                                  $ref: "#/components/schemas/WarehouseModel"
 */
router.post("", [
  authorizationFn,
  isAdminOrManager,
  body('name').isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('address').isLength({ min: 5 }).withMessage('La direccion debe tener al menos 5 caracteres'),
  warehouseValidation
], createWarehouse);

/**
 * @swagger
 * /api/warehouse/{warehouseId}:
 *  put:
 *      summary: Update a warehouse
 *      description: Update a warehouse by id
 *      tags:
 *          - Warehouse
 *      security:
 *          - BearerAuth: []
 *      parameters:
 *          - name: warehouseId
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
 *                          address:
 *                              type: string
 *                          isEnabled:
 *                              type: boolean
 *      responses:
 *          200:
 *              description: Warehouse updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              warehouse:
 *                                  type: object
 *                                  $ref: '#/components/schemas/WarehouseModel'
 */
router.put("/:warehouseId", [
  authorizationFn,
  isAdminOrManager,
  body('name').optional().isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('address').optional().isLength({ min: 5 }).withMessage('La direccion debe tener al menos 5 caracteres'),
  warehouseValidation
], updateWarehouse);

/**
 * @swagger
 * /api/warehouse/{warehouseId}:
 *  delete:
 *      summary: Delete a warehouse
 *      description: Soft delete a warehouse by id
 *      tags:
 *          - Warehouse
 *      security:
 *          - BearerAuth: []
 *      parameters:
 *          - name: warehouseId
 *            in: path
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Warehouse deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              warehouse:
 *                                  type: object
 *                                  $ref: '#/components/schemas/WarehouseModel'
 */
router.delete("/:warehouseId", [authorizationFn, isAdminOrManager], deleteWarehouse);

module.exports = router;
