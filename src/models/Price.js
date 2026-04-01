const { Schema, model } = require('mongoose');
const { coinEnum } = require('../enums/coinEnum');

/**
 * @swagger
 * components:
 *  schemas:
 *    CoinType:
 *      type: string
 *      enum:
 *        - $
 *        - Brs.
 *
 *    PriceModel:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *        amount:
 *          type: number
 *        coin:
 *          type: string
 *          $ref: "#/components/schemas/CoinType"
 *        productId:
 *          type: string
 *        createdBy:
 *          type: string
 *        createdAt:
 *          type: integer
 *        updatedAt:
 *          type: integer
 *      required:
 *        - _id
 *        - amount
 *        - coin
 *        - isActive
 *        - productId
 *        - createdBy
 *        - createdAt
 *        - updatedAt
 */

const PriceSchema = new Schema(
  {
    amount: {
      type: Number,
      required: [true, 'amount is required'],
    },
    coin: {
      type: String,
      enum: Object.values(coinEnum),
      required: [true, 'coin is required'],
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'product',
      required: [true, 'productId is required'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'createdBy is required'],
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
    toJSON: {
      transform(priceSch, price) {
        price.createdAt = priceSch.createdAt.getTime();
        price.updatedAt = priceSch.updatedAt.getTime();

        return price;
      },
    },
  }
);

module.exports = model('price', PriceSchema);
