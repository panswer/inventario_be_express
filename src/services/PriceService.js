const Price = require('../models/Price');

class PriceService {
    /**
     * @type {PriceService}
     */
    static instance;

    static getInstance() {
        if (!this.instance) {
            this.instance = new PriceService();
        }

        return this.instance;
    }

    static destroyInstance() {
        delete this.instance;
    }

    /**
     * Get price by product ID
     * 
     * @param {string} productId 
     * @returns {Promise<import('../models/Price')>}
     */
    getPriceByProductId(productId) {
        return Price.findOne({ productId });
    }

    /**
     * Get price by ID and coin
     * 
     * @param {string} priceId 
     * @param {string} coin 
     * @returns {Promise<import('../models/Price')>}
     */
    getPriceByIdAndCoin(priceId, coin) {
        return Price.findOne({ _id: priceId, coin });
    }

    /**
     * Create a new price
     * 
     * @param {Object} priceData 
     * @returns {Promise<import('../models/Price')>}
     */
    createPrice(priceData) {
        return new Price(priceData).save();
    }
}

module.exports = PriceService;