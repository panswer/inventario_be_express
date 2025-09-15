const { Schema, model } = require("mongoose");
const { coinEnum } = require("../enums/coinEnum");

/**
 * @typedef {object} SaleSchema
 * @property {string} _id
 * @property {number} count
 * @property {string} productId
 * @property {number} price
 * @property {string} billId
 * @property {string} coin
 * @property {number} createdAt
 * @property {number} updatedAt
 * 
 * @typedef {object} SaleRequest
 * @property {number} count
 * @property {string} productId
 * @property {number} price
 * @property {string} coin
 */

/**
 * @swagger
 * components:
 *  schemas:
 *      SaleRequest:
 *          type: object
 *          properties:
 *              count:
 *                  type: number
 *              productId:
 *                  type: string
 *              price:
 *                  type: number
 *              coin:
 *                  type: string
 *                  $ref: "#/components/schemas/CoinType"
 *          required:
 *            - count
 *            - productId
 *            - price
 *            - coin
 *      SaleModel:
 *          type: object
 *          properties:
 *              _id:
 *                  type: string
 *              count:
 *                  type: number
 *              productId:
 *                  type: string
 *              price:
 *                  type: string
 *              billId:
 *                  type: string
 *              coin:
 *                  type: string
 *                  $ref: "#/components/schemas/CoinType"
 *              createdAt:
 *                  type: number
 *              updatedAt:
 *                  type: number
 *          required:
 *            - _id
 *            - count
 *            - productId
 *            - price
 *            - billId
 *            - coin
 *            - createdAt
 *            - updatedAt
 */

const SaleSchema = new Schema(
  {
    count: {
      type: Number,
      min: 1,
      required: [true, "It's required how many items"],
    },
    productId: {
      type: Schema.Types.ObjectId,
      required: [true, "productId is required"],
      ref: "product",
    },
    price: {
      type: Number,
      required: [true, "The price is required"],
    },
    billId: {
      type: Schema.Types.ObjectId,
      required: [true, "bill's id is required"],
      ref: "bill",
    },
    coin: {
      type: String,
      required: [true, "coin is required"],
      enum: Object.values(coinEnum),
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

module.exports = model("sale", SaleSchema);
