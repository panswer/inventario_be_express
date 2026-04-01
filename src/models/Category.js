const { Schema, model } = require('mongoose');

/**
 * @swagger
 * components:
 *  schemas:
 *      CategoryModel:
 *          type: object
 *          properties:
 *              _id:
 *                  type: string
 *              name:
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
 *            - isEnabled
 *            - createdBy
 *            - createdAt
 *            - updatedAt
 */

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
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
      transform(categorySch, category) {
        category.createdAt = categorySch.createdAt.getTime();
        category.updatedAt = categorySch.updatedAt.getTime();

        return category;
      },
    },
  }
);

module.exports = model('category', CategorySchema);
