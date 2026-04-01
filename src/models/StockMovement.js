const { Schema, model } = require('mongoose');
const { stockMovementEnum } = require('../enums/stockMovementEnum');

/**
 * @swagger
 * components:
 *  schemas:
 *    StockMovementModel:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *        type:
 *          type: string
 *          enum: [initial, in, out, adjust, transfer]
 *        quantity:
 *          type: number
 *        previousQuantity:
 *          type: number
 *        newQuantity:
 *          type: number
 *        productId:
 *          type: object
 *          properties:
 *            _id:
 *              type: string
 *            name:
 *              type: string
 *        warehouseId:
 *          type: object
 *          properties:
 *            _id:
 *              type: string
 *            name:
 *              type: string
 *        billId:
 *          type: object
 *          properties:
 *            _id:
 *              type: string
 *        reason:
 *          type: string
 *        transferToWarehouseId:
 *          type: object
 *          description: For transfer movements (source warehouse), the destination warehouse
 *          properties:
 *            _id:
 *              type: string
 *            name:
 *              type: string
 *        transferFromWarehouseId:
 *          type: object
 *          description: For transfer movements (destination warehouse), the source warehouse
 *          properties:
 *            _id:
 *              type: string
 *            name:
 *              type: string
 *        createdBy:
 *          type: string
 *        createdAt:
 *          type: integer
 *        updatedAt:
 *          type: integer
 */

const StockMovementSchema = new Schema(
  {
    type: {
      type: String,
      required: [true, 'type is required'],
      enum: {
        values: Object.values(stockMovementEnum),
        message: 'Invalid movement type',
      },
    },
    quantity: {
      type: Number,
      required: [true, 'quantity is required'],
    },
    previousQuantity: {
      type: Number,
      required: [true, 'previousQuantity is required'],
    },
    newQuantity: {
      type: Number,
      required: [true, 'newQuantity is required'],
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'product',
      required: [true, 'productId is required'],
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: 'warehouse',
      required: [true, 'warehouseId is required'],
    },
    billId: {
      type: Schema.Types.ObjectId,
      ref: 'bill',
      default: null,
    },
    reason: {
      type: String,
      default: null,
    },
    transferToWarehouseId: {
      type: Schema.Types.ObjectId,
      ref: 'warehouse',
      default: null,
    },
    transferFromWarehouseId: {
      type: Schema.Types.ObjectId,
      ref: 'warehouse',
      default: null,
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
      transform(docSch, stockMovement) {
        stockMovement.createdAt = docSch.createdAt.getTime();
        stockMovement.updatedAt = docSch.updatedAt.getTime();
        return stockMovement;
      },
    },
  }
);

StockMovementSchema.index({ productId: 1, warehouseId: 1, createdAt: -1 });
StockMovementSchema.index({ createdAt: -1 });

module.exports = model('stockMovement', StockMovementSchema);
