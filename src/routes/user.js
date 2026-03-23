const { Router } = require("express");
const { body } = require("express-validator");
const { isAdmin } = require("../middlewares/roleAuthorization");
const { getUsers, updateUserRole } = require("../controllers/user");

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
 *          - bearerAuth: []
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
router.get("", isAdmin, getUsers);

/**
 * @swagger
 * /api/users/{id}/role:
 *  patch:
 *      tags:
 *          - Users
 *      summary: Update user role (admin only)
 *      description: Update the role of a specific user
 *      security:
 *          - bearerAuth: []
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
router.patch("/:id/role", isAdmin, [
    body("role").isIn(["admin", "manager", "user"]).withMessage("Role must be admin, manager, or user"),
], updateUserRole);

module.exports = router;