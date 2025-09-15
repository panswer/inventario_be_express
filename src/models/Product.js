const { Schema, model } = require("mongoose");

/**
 * @swagger
 * components:
 *  schemas:
 *      ProductModel:
 *          type: object
 *          properties:
 *              _id:
 *                  type: string
 *              name:
 *                  type: string
 *              inStock:
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
 *            - createdBy
 *            - createdAt
 *            - updatedAt
 *      ProductPriceModel:
 *          type: object
 *          allOf:
 *              - $ref: '#/components/schemas/ProductModel'
 *          properties:
 *              prices:
 *                type: array
 *                items:
 *                    type: object
 *                    $ref: '#/components/schemas/PriceModel'
 */

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    inStock: {
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
      transform: function (productSch, product) {
        product.createdAt = productSch.createdAt.getTime();
        product.updatedAt = productSch.updatedAt.getTime();

        return product;
      },
    },
  }
);

module.exports = model("product", ProductSchema);
