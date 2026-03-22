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
 *        warehouseId:
 *          type: object
 *          properties:
 *            _id:
 *              type: string
 *            name:
 *              type: string
 *            address:
 *              type: string
 *            isEnabled:
 *              type: boolean
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
 *        createdAt:
 *          type: integer
 *        updatedAt:
 *          type: integer
 *      required:
 *        - _id
 *        - quantity
 *        - productId
 *        - warehouseId
 *        - createdAt
 *        - updatedAt
 */

const StockSchema = new Schema(
  {
    quantity: {
      type: Number,
      required: [true, "quantity is required"],
      default: 0,
      min: [0, "quantity cannot be negative"],
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
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "warehouse",
      required: [true, "warehouseId is required"],
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

StockSchema.index({ productId: 1, warehouseId: 1 }, { unique: true });

module.exports = model("stock", StockSchema);
