const { Router } = require("express");
const { body } = require('express-validator');
const { getSuppliers, getSupplierById, createSupplier, updateSupplierById, toggleSupplier } = require("../controllers/supplier");
const { authorizationFn } = require("../middlewares/authorization");
const { isAdminOrManager } = require("../middlewares/roleAuthorization");
const { supplierValidation } = require("../middlewares/supplier");

const router = Router();

/**
 * @swagger
 * /api/supplier:
 *  get:
 *      summary: Get all suppliers
 *      description: Get all suppliers, optionally filter only enabled
 *      security:
 *          - BearerAuth: []
 *      tags:
 *          - Supplier
 *      parameters:
 *          - in: query
 *            name: onlyEnabled
 *            description: Filter only enabled suppliers
 *            schema:
 *              type: boolean
 *      responses:
 *          200:
 *              description: List of suppliers
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              suppliers:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      $ref: "#/components/schemas/SupplierModel"
 */
router.get("", [authorizationFn, isAdminOrManager], getSuppliers);

/**
 * @swagger
 * /api/supplier:
 *  post:
 *      summary: Create a supplier
 *      description: Create a new supplier
 *      tags:
 *          - Supplier
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
 *                          rif:
 *                              type: string
 *                          phone:
 *                              type: string
 *                          address:
 *                              type: string
 *                          contactPerson:
 *                              type: string
 *                      required:
 *                          - name
 *                          - rif
 *      responses:
 *          201:
 *              description: Supplier created successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              supplier:
 *                                  type: object
 *                                  $ref: "#/components/schemas/SupplierModel"
 */
router.post("", [
    authorizationFn,
    isAdminOrManager,
    body('name').isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    body('rif').isLength({ min: 2 }).withMessage('El rif debe tener al menos 2 caracteres'),
    supplierValidation
], createSupplier);

/**
 * @swagger
 * /api/supplier/{supplierId}:
 *  get:
 *      summary: Get a supplier by id
 *      description: Get a supplier by id
 *      tags:
 *          - Supplier
 *      security:
 *          - BearerAuth: []
 *      parameters:
 *          - name: supplierId
 *            in: path
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Supplier
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              supplier:
 *                                  type: object
 *                                  $ref: '#/components/schemas/SupplierModel'
 */
router.get("/:supplierId", [authorizationFn, isAdminOrManager], getSupplierById);

/**
 * @swagger
 * /api/supplier/{supplierId}:
 *  put:
 *      summary: Update a supplier
 *      description: Update a supplier by id
 *      tags:
 *          - Supplier
 *      security:
 *          - BearerAuth: []
 *      parameters:
 *          - name: supplierId
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
 *                          rif:
 *                              type: string
 *                          phone:
 *                              type: string
 *                          address:
 *                              type: string
 *                          contactPerson:
 *                              type: string
 *      responses:
 *          200:
 *              description: Supplier updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              supplier:
 *                                  type: object
 *                                  $ref: '#/components/schemas/SupplierModel'
 */
router.put("/:supplierId", [
    authorizationFn,
    isAdminOrManager,
    body('name').optional().isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    body('rif').optional().isLength({ min: 2 }).withMessage('El rif debe tener al menos 2 caracteres'),
    supplierValidation
], updateSupplierById);

/**
 * @swagger
 * /api/supplier/{supplierId}/toggle:
 *  patch:
 *      summary: Toggle supplier status
 *      description: Enable or disable a supplier
 *      tags:
 *          - Supplier
 *      security:
 *          - BearerAuth: []
 *      parameters:
 *          - name: supplierId
 *            in: path
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Supplier toggled
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              supplier:
 *                                  type: object
 *                                  $ref: '#/components/schemas/SupplierModel'
 */
router.patch("/:supplierId/toggle", [authorizationFn, isAdminOrManager], toggleSupplier);

module.exports = router;
