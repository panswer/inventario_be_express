const { Schema, model } = require("mongoose");

/**
 * @typedef {object} BillSchema
 * @property {string} _id
 * @property {string} userId
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/**
 * @swagger
 * components:
 *  schemas:
 *      BillModel:
 *          type: object
 *          properties:
 *              _id:
 *                  type: string
 *              userId:
 *                  type: string
 *              createdAt:
 *                  type: number
 *              updatedAt:
 *                  type: number
 *          required:
 *            - _id
 *            - userId
 *            - sellers
 *            - createdAt
 *            - updatedAt
 *      BillDetailModel:
 *          type: object
 *          allOf:
 *            - $ref: '#/components/schemas/BillModel'
 *          properties:
 *              sales:
 *                  type: array
 *                  items:
 *                      type: object
 *                      allOf:
 *                        - $ref: '#/components/schemas/SaleModel'
 *                      properties:
 *                          productId:
 *                              type: object
 *                              $ref: '#/components/schemas/ProductModel'
 *              total:
 *                  type: number
 *          required:
 *            - sales
 *            - total
 */

const BillSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "user's id is required"],
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    toJSON: {
      transform: function (billSch, bill) {
        bill.createdAt = billSch.createdAt.getTime();
        bill.updatedAt = billSch.updatedAt.getTime();

        return bill;
      },
    },
  }
);

module.exports = model("bill", BillSchema);
