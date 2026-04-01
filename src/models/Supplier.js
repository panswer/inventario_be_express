const { Schema, model } = require('mongoose');

/**
 * @swagger
 * components:
 *  schemas:
 *      SupplierModel:
 *          type: object
 *          properties:
 *              _id:
 *                  type: string
 *              name:
 *                  type: string
 *              rif:
 *                  type: string
 *              phone:
 *                  type: string
 *              address:
 *                  type: string
 *              contactPerson:
 *                  type: string
 *              isEnabled:
 *                  type: boolean
 *              createdBy:
 *                  type: string
 *              createdAt:
 *                  type: integer
 *              updatedAt:
 *                  type: integer
 *          required:
 *            - _id
 *            - name
 *            - rif
 *            - isEnabled
 *            - createdBy
 *            - createdAt
 *            - updatedAt
 */

const SupplierSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
    },
    rif: {
      type: String,
      required: [true, 'rif is required'],
      unique: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    contactPerson: {
      type: String,
    },
    isEnabled: {
      type: Boolean,
      default: true,
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
      transform(supplierSch, supplier) {
        supplier.createdAt = supplierSch.createdAt.getTime();
        supplier.updatedAt = supplierSch.updatedAt.getTime();

        return supplier;
      },
    },
  }
);

module.exports = model('supplier', SupplierSchema);
