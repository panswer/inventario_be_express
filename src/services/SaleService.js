const Sale = require("../models/Sale");
const StockService = require("./StockService");
const { stockMovementEnum } = require("../enums/stockMovementEnum");

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
     * Create a new sale record and update stock
     * 
     * @param {Object} saleData 
     * @param {string} saleData.billId
     * @param {string} saleData.coin
     * @param {number} saleData.count
     * @param {string} saleData.stockId
     * @param {string} userId - User performing the sale
     * @returns {Promise<import('../models/Sale')>}
     */
    async createSaleFlow(saleData, userId) {
        const stockService = StockService.getInstance();

        const stock = await stockService.getStockById(saleData.stockId, saleData.coin);
        if (!stock) {
            throw new Error("Stock not found");
        }

        if (!stock.price) {
            throw new Error("No price defined for this product");
        }

        const saleWithPrice = {
            ...saleData,
            price: stock.price.amount,
        };

        const sale = await this.createSale(saleWithPrice);

        await stockService.removeStock(saleData.stockId, saleData.count, userId, saleData.billId, stockMovementEnum.out);

        return sale;
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