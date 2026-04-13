const { Router } = require('express');
const { body } = require('express-validator');
const { isAdmin } = require('../middlewares/roleAuthorization');
const { userValidation } = require('../middlewares/user');
const { getUsers, updateUserRole, assignWarehouse, getProfile } = require('../controllers/user');
const { authorizationFn } = require('../middlewares/authorization');

const router = Router();

/**
 * @swagger
 * /api/users:
 *  get:
 *      tags:
 *          - Users
 *      summary: Get all users (admin only)
 *      description: Returns a list of all users with their roles
 *      security:
 *          - BearerAuth: []
 *      responses:
 *          200:
 *              description: Success
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              users:
 *                                  type: array
 *                                  items:
 *                                      $ref: "#/components/schemas/UserModel"
 *          403:
 *              description: Forbidden
 *          401:
 *              description: Unauthorized
 */
router.get('', isAdmin, getUsers);

/**
 * @swagger
 * /api/users/profile:
 *  get:
 *      tags:
 *          - Users
 *      summary: Get current user profile
 *      description: Returns the profile of the authenticated user
 *      security:
 *          - BearerAuth: []
 *      responses:
 *          200:
 *              description: Success
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              user:
 *                                  $ref: "#/components/schemas/UserModel"
 *          401:
 *              description: Unauthorized
 */
router.get('/profile', authorizationFn, getProfile);

/**
 * @swagger
 * /api/users/{id}/role:
 *  patch:
 *      tags:
 *          - Users
 *      summary: Update user role (admin only)
 *      description: Update the role of a specific user
 *      security:
 *          - BearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *                type: string
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          role:
 *                              type: string
 *                              enum: [admin, manager, user]
 *      responses:
 *          200:
 *              description: Success
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/UserModel"
 *          403:
 *              description: Forbidden
 *          401:
 *              description: Unauthorized
 *          404:
 *              description: User not found
 *          400:
 *              description: Invalid role
 */
router.patch(
  '/:id/role',
  isAdmin,
  [
    body('role')
      .isIn(['admin', 'manager', 'user'])
      .withMessage('Role must be admin, manager, or user'),
  ],
  userValidation,
  updateUserRole
);

/**
 * @swagger
 * /api/users/{id}/warehouse:
 *  patch:
 *      tags:
 *          - Users
 *      summary: Assign warehouse to user (admin only)
 *      description: Assign a warehouse to a specific user
 *      security:
 *          - BearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *                type: string
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          warehouseId:
 *                              type: string
 *                              description: Warehouse ID to assign
 *      responses:
 *          200:
 *              description: Success
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/UserModel"
 *          403:
 *              description: Forbidden
 *          401:
 *              description: Unauthorized
 *          404:
 *              description: User not found
 *          400:
 *              description: Invalid warehouseId
 */
router.patch(
  '/:id/warehouse',
  isAdmin,
  [body('warehouseId').isMongoId().withMessage('Invalid warehouseId')],
  userValidation,
  assignWarehouse
);

module.exports = router;
