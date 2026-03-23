const { Schema, model } = require("mongoose");
const { userRoleEnum } = require("../enums/userRoleEnum");

const roles = Object.values(userRoleEnum);

/**
 * @typedef {object} UserSchema
 * @property {string} _id
 * @property {string} username
 * @property {string} role
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/**
 * @swagger
 * components:
 *  schemas:
 *    UserModel:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *          example: 6805887a4368ad575e37be5f
 *        username:
 *          type: string
 *          example: example@mailinator.com
 *        role:
 *          type: string
 *          enum: [admin, manager, cashier, user]
 *          example: admin
 *        createdAt:
 *          type: integer
 *          example: 1745250570613
 *        updatedAt:
 *          type: integer
 *          example: 1745250570613
 *        __v:
 *          type: number
 *          example: 0
 *      required:
 *        - _id
 *        - username
 *        - createdAt
 *        - updatedAt
 */
const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    role: {
      type: String,
      enum: {
        values: roles,
        message: "role must be one of: admin, manager, cashier, user",
      },
      default: userRoleEnum.user,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    toJSON: {
      transform: function (userSch, user) {
        delete user.password;
        delete user.__v;
        user.createdAt = userSch.createdAt.getTime();
        user.updatedAt = userSch.updatedAt.getTime();

        return user;
      },
    },
    toObject: {
      transform: function (_, user) {
        delete user.password;
        return user;
      },
    },
  }
);

module.exports = model("user", UserSchema);
