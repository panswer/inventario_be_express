const Product = require('../models/Product');
const mongoose = require('mongoose');

class ProductService {
  /**
   * @type {ProductService}
   */
  static instance;

  static getInstance() {
    if (!this.instance) {
      this.instance = new ProductService();
    }

    return this.instance;
  }

  static destroyInstance() {
    delete this.instance;
  }

  /**
   * Get products with pagination and optional category filter
   *
   * @param {number} skip
   * @param {number} limit
   * @param {Array<string>} [categories] - Array of category IDs to filter by (AND logic)
   * @param {string} [warehouseId] - Optional warehouse ID to include stock info
   * @returns {Promise<Array<import('../models/Product')>>}
   */
  getProducts(skip, limit, categories, warehouseId) {
    if (warehouseId) {
      return this.getProductsWithStock(skip, limit, categories, warehouseId);
    }

    const filter = categories?.length ? { categories: { $all: categories } } : {};
    return Product.find(filter).populate('categories').skip(skip).limit(limit);
  }

  /**
   * Get products with stock info for a specific warehouse
   *
   * @param {number} skip
   * @param {number} limit
   * @param {Array<string>} [categories]
   * @param {string} warehouseId
   * @returns {Promise<Array<object>>}
   */
  async getProductsWithStock(skip, limit, categories, warehouseId) {
    const filter = categories?.length ? { categories: { $all: categories } } : {};

    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'stocks',
          let: { productId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$productId', '$$productId'] },
                warehouseId: new mongoose.Types.ObjectId(warehouseId),
              },
            },
          ],
          as: 'stock',
        },
      },
      { $unwind: { path: '$stock', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          stock: {
            quantity: { $ifNull: ['$stock.quantity', 0] },
            minQuantity: { $ifNull: ['$stock.minQuantity', 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categories',
        },
      },
      { $skip: skip },
      { $limit: limit },
    ];

    return Product.aggregate(pipeline);
  }

  /**
   * Count total products
   *
   * @param {Array<string>} [categories] - Array of category IDs to filter by
   * @param {string} [warehouseId] - Optional warehouse ID
   * @returns {Promise<number>}
   */
  countProducts(categories, warehouseId) {
    if (warehouseId) {
      return this.countProductsWithStock(categories, warehouseId);
    }
    const filter = categories?.length ? { categories: { $all: categories } } : {};
    return Product.find(filter).countDocuments();
  }

  /**
   * Count products with stock for a warehouse
   *
   * @param {Array<string>} [categories]
   * @param {string} warehouseId
   * @returns {Promise<number>}
   */
  async countProductsWithStock(categories, warehouseId) {
    const filter = categories?.length ? { categories: { $all: categories } } : {};

    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'stocks',
          let: { productId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$productId', '$$productId'] },
                warehouseId: new mongoose.Types.ObjectId(warehouseId),
              },
            },
          ],
          as: 'stock',
        },
      },
      { $match: { stock: { $ne: [] } } },
      { $count: 'count' },
    ];

    const result = await Product.aggregate(pipeline);
    return result[0]?.count || 0;
  }

  /**
   * Find product by ID
   *
   * @param {string} productId
   * @returns {Promise<import('../models/Product')>}
   */
  getProductById(productId) {
    return Product.findById(productId).populate('categories');
  }

  findByBarcode(barcode) {
    return Product.findOne({ barcode });
  }

  /**
   * Create a new product
   *
   * @param {Object} productData
   * @returns {Promise<import('../models/Product')>}
   */
  createProduct(productData) {
    return new Product(productData).save();
  }
}

module.exports = ProductService;
