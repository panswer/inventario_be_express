const { Router } = require('express');
const { body } = require('express-validator');
const {
  signUpValidator,
  resetPasswordVerifyValidator,
  authorizationFn,
} = require('../middlewares/authorization');
const {
  signIn,
  signUp,
  resetPassword,
  resetPasswordVerify,
  signOut,
} = require('../controllers/authentication');

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
router.post('/sign-in', signIn);

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
router.post(
  '/sign-up',
  [
    body('email').isEmail().withMessage('Email is not valid'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    signUpValidator,
  ],
  signUp
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *      tags:
 *       - Authentication
 *      summary: Send reset password
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          email:
 *                              type: string
 *                              example: "email@example.com"
 *                      required:
 *                        - email
 *      responses:
 *          200:
 *              description: Possible token send
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *          500:
 *              description: Mail service is not working
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              code:
 *                                  type: integer
 *                                  example: 2000
 */
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /api/auth/reset-password/verify:
 *  post:
 *      tags:
 *        - Authentication
 *      summary: Update user password by token and email
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          token:
 *                              type: string
 *                              example: 123456
 *                          email:
 *                              type: string
 *                              example: "email@example.com"
 *                          password:
 *                              type: string
 *                              example: "strongPassword123"
 *      responses:
 *          202:
 *              description: User password updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *          404:
 *              description: token not valid
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              code:
 *                                  type: integer
 *                                  example: 1003
 *          500:
 *              description: Unknown internal error
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              code:
 *                                  type: integer
 *                                  example: 1004
 */
router.post(
  '/reset-password/verify',
  [
    body('email').isEmail().withMessage('Email is not valid'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('token').isLength({ min: 6 }).withMessage('Token must be at least 6 characters'),
    resetPasswordVerifyValidator,
  ],
  resetPasswordVerify
);

/**
 * @swagger
 * /api/auth/sign-out:
 *  post:
 *      tags:
 *          - Authentication
 *      summary: Sign out and invalidate session
 *      description: Invalidates the current session and removes it from the database
 *      produces:
 *          - application/json
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              description: Signed out successfully
 *          401:
 *              description: Unauthorized - invalid or missing token
 */
router.post('/sign-out', authorizationFn, signOut);

module.exports = router;
