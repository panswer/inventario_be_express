const { Schema, model } = require('mongoose');

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
 *              image:
 *                  type: string
 *                  description: Path to product image
 *              barcode:
 *                  type: string
 *                  description: Product barcode (optional)
 *              categories:
 *                  type: array
 *                  items:
 *                    type: object
 *                    $ref: '#/components/schemas/CategoryModel'
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
      required: [true, 'name is required'],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: null,
    },
    barcode: {
      type: String,
      default: null,
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'category',
      },
    ],
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
      transform(productSch, product) {
        product.createdAt = productSch.createdAt.getTime();
        product.updatedAt = productSch.updatedAt.getTime();

        return product;
      },
    },
  }
);

ProductSchema.index(
  { barcode: 1 },
  { unique: true, partialFilterExpression: { barcode: { $ne: null } } }
);

module.exports = model('product', ProductSchema);
