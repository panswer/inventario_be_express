const Product = require('../models/Product');

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
     * Get products with pagination
     * 
     * @param {number} skip 
     * @param {number} limit 
     * @returns {Promise<Array<import('../models/Product')>>}
     */
    getProducts(skip, limit) {
        return Product.find().skip(skip).limit(limit);
    }

    /**
     * Count total products
     * 
     * @returns {Promise<number>}
     */
    countProducts() {
        return Product.find().countDocuments();
    }

    /**
     * Find product by ID
     * 
     * @param {string} productId 
     * @returns {Promise<import('../models/Product')>}
     */
    getProductById(productId) {
        return Product.findById(productId);
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