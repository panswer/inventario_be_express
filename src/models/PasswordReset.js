const { Schema, model } = require('mongoose');

/**
 * @typedef {object} PasswordResetSchema
 * @property {string} userId
 * @property {string} token
 * @property {number} createdAt
 */

/**
 * @swagger
 * components:
 *  schemas:
 *      PasswordResetModel:
 *          type: object
 *          properties:
 *              _id:
 *                  type: string
 *                  example: 69adbab2699262aa01e9d36e
 *              userId:
 *                  type: string
 *                  example: 6805887a4368ad575e37be5f
 *              token:
 *                  type: string
 *                  example: abc654
 *              createdAt:
 *                  type: integer
 *                  example: 1745250570613
 */

const PasswordResetSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'user id is required'],
    },
    token: {
      type: String,
      required: [true, 'token is required'],
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
    },
  }
);

module.exports = model('passwordReset', PasswordResetSchema);
