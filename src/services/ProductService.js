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
     * Get products with pagination and optional category filter
     * 
     * @param {number} skip 
     * @param {number} limit 
     * @param {Array<string>} [categories] - Array of category IDs to filter by (AND logic)
     * @returns {Promise<Array<import('../models/Product')>>}
     */
    getProducts(skip, limit, categories) {
        const filter = categories?.length 
            ? { categories: { $all: categories } }
            : {};
        return Product.find(filter).populate('categories').skip(skip).limit(limit);
    }

    /**
     * Count total products
     * 
     * @param {Array<string>} [categories] - Array of category IDs to filter by
     * @returns {Promise<number>}
     */
    countProducts(categories) {
        const filter = categories?.length 
            ? { categories: { $all: categories } }
            : {};
        return Product.find(filter).countDocuments();
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