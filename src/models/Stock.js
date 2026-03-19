const { Schema, model } = require("mongoose");

/**
 * @swagger
 * components:
 *  schemas:
 *    StockModel:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *        quantity:
 *          type: number
 *        minQuantity:
 *          type: number
 *        productId:
 *          type: object
 *          properties:
 *            _id:
 *              type: string
 *            name:
 *              type: string
 *            inStock:
 *              type: boolean
 *            categories:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  _id:
 *                    type: string
 *                  name:
 *                    type: string
 *                  isEnabled:
 *                    type: boolean
 *            createdBy:
 *              type: string
 *            createdAt:
 *              type: integer
 *            updatedAt:
 *              type: integer
 *        price:
 *          type: object
 *          properties:
 *            _id:
 *              type: string
 *            amount:
 *              type: number
 *            coin:
 *              type: string
 *              enum:
 *                - "$"
 *                - "Brs."
 *            createdAt:
 *              type: integer
 *            updatedAt:
 *              type: integer
 *        createdAt:
 *          type: integer
 *        updatedAt:
 *          type: integer
 *      required:
 *        - _id
 *        - quantity
 *        - productId
 *        - createdAt
 *        - updatedAt
 */

const StockSchema = new Schema(
  {
    quantity: {
      type: Number,
      required: [true, "quantity is required"],
      default: 0,
    },
    minQuantity: {
      type: Number,
      default: 0,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: [true, "productId is required"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "createdBy is required"],
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    toJSON: {
      transform: function (stockSch, stock) {
        stock.createdAt = stockSch.createdAt.getTime();
        stock.updatedAt = stockSch.updatedAt.getTime();
        return stock;
      },
    },
  }
);

module.exports = model("stock", StockSchema);
