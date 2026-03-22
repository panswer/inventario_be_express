const { Schema, model } = require("mongoose");

/**
 * @swagger
 * components:
 *  schemas:
 *      WarehouseModel:
 *          type: object
 *          properties:
 *              _id:
 *                  type: string
 *              name:
 *                  type: string
 *              address:
 *                  type: string
 *              isEnabled:
 *                  type: boolean
 *              createdBy:
 *                  type: object
 *                  properties:
 *                      _id:
 *                          type: string
 *                      username:
 *                          type: string
 *              createdAt:
 *                  type: integer
 *              updatedAt:
 *                  type: integer
 *          required:
 *            - _id
 *            - name
 *            - address
 *            - createdBy
 *            - createdAt
 *            - updatedAt
 */

const WarehouseSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    address: {
      type: String,
      required: [true, "address is required"],
    },
    isEnabled: {
      type: Boolean,
      default: true,
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
      transform: function (warehouseSch, warehouse) {
        if (warehouseSch.createdAt) {
          warehouse.createdAt = warehouseSch.createdAt.getTime();
        }
        if (warehouseSch.updatedAt) {
          warehouse.updatedAt = warehouseSch.updatedAt.getTime();
        }
        if (warehouse.createdBy && typeof warehouse.createdBy === 'object' && warehouse.createdBy.password) {
          delete warehouse.createdBy.password;
        }
        return warehouse;
      },
    },
  }
);

module.exports = model("warehouse", WarehouseSchema);
