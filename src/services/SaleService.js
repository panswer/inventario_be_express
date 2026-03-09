const Sale = require("../models/Sale");

class SaleService {
    /**
     * @type {SaleService}
     */
    static instance;

    static getInstance() {
        if (!this.instance) {
            this.instance = new SaleService();
        }

        return this.instance;
    }

    static destroyInstance() {
        delete this.instance;
    }

    /**
     * Create a new sale record
     * 
     * @param {Object} saleData 
     * @returns {Promise<import('../models/Sale')>}
     */
    createSale(saleData) {
        return new Sale(saleData).save();
    }

    /**
     * Get sales by bill ID
     * 
     * @param {string} billId 
     * @returns {Promise<Array<import('../models/Sale')>>}
     */
    getSalesByBillId(billId) {
        return Sale.find({ billId });
    }
}

module.exports = SaleService;