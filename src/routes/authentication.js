const { Router } = require("express");
const { signIn, signUp } = require("../controllers/authentication");

const router = Router();

/**
 * @swagger
 * components:
 *  schemas:
 *      SignInSuccess:
 *          type: object
 *          properties:
 *              authorization:
 *                  type: string
 *      SignInRequest:
 *          type: object
 *          properties:
 *              email:
 *                  type: string
 *              password:
 *                  type: string
 *          required:
 *              - email
 *              - password
 */

/**
 * @swagger
 * /api/auth/sign-in:
 *  post:
 *      tags:
 *          - Authentication
 *      summary: Get token by username and password
 *      description: Get an authorization token by username and password
 *      produces:
 *          - application/json
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/SignInRequest"
 *      responses:
 *          200:
 *              description: Success result
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/SignInSuccess"
 */
router.post("/sign-in", signIn);

/**
 * @swagger
 * /api/auth/sign-up:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Sign up a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: strongPassword123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/UserModel"
 *       400:
 *         description: Bad request, invalid input
 *       409:
 *         description: Conflict, user already exists
 *       500:
 *         description: Internal server error
 */
router.post("/sign-up", signUp);

module.exports = router;
