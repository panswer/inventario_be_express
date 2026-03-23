const mongoose = require('mongoose');
const StockMovementService = require('./StockMovementService');
const LoggerService = require('./LoggerService');
const Stock = require('../models/Stock');
const { stockMovementEnum } = require('../enums/stockMovementEnum');

class StockService {
    /**
     * @type {StockService}
     */
    static instance;

    static getInstance() {
        if (!this.instance) {
            this.instance = new StockService();
        }
        return this.instance;
    }

    static destroyInstance() {
        delete this.instance;
    }

    /**
     * Log a stock movement
     *
     * @param {Object} params
     * @private
     */
    _logMovement({ type, quantity, previousQuantity, newQuantity, stock, userId, billId = null, reason = null }) {
        const movementService = StockMovementService.getInstance();

        movementService.logMovement({
            type,
            quantity,
            previousQuantity,
            newQuantity,
            productId: stock.productId,
            warehouseId: stock.warehouseId,
            createdBy: userId,
            billId,
            reason,
        }).catch((err) => {
            const logger = LoggerService.getInstance();
            logger.error('stockMovementService@_logMovement', {
                reason: err?.message ?? 'Unknown error',
                type: 'logic'
            });
        });
    }

    /**
     * Build aggregation pipeline with latest price lookup and warehouse lookup
     * 
     * @param {Array} pipeline - Additional pipeline stages
     * @param {string} [coin] - Optional coin filter for price
     * @returns {Array}
     */
    buildAggregationPipeline(pipeline = [], coin = null) {
        const priceMatchStage = coin 
            ? { $match: { $expr: { $eq: ['$productId', '$$pid'] }, coin } }
            : { $match: { $expr: { $eq: ['$productId', '$$pid'] } } };

        return [
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'productId'
                }
            },
            { $unwind: '$productId' },
            {
                $lookup: {
                    from: 'warehouses',
                    localField: 'warehouseId',
                    foreignField: '_id',
                    as: 'warehouseId'
                }
            },
            {
                $unwind: {
                    path: '$warehouseId',
                    preserveNullAndEmptyArrays: true
                }
            },
            { $match: { 'warehouseId.isEnabled': true } },
            {
                $lookup: {
                    from: 'categories',
                    let: { catIds: '$productId.categories' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$catIds'] }
                            }
                        }
                    ],
                    as: 'productId.categories'
                }
            },
            {
                $lookup: {
                    from: 'prices',
                    let: { pid: '$productId._id' },
                    pipeline: [
                        priceMatchStage,
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'price'
                }
            },
            {
                $unwind: {
                    path: '$price',
                    preserveNullAndEmptyArrays: true
                }
            },
            ...pipeline
        ];
    }

    /**
     * Get stocks with pagination and latest price
     * 
     * @param {number} skip 
     * @param {number} limit 
     * @param {string} [warehouseId] - Optional warehouse filter
     * @returns {Promise<{stocks: Array, total: number}>}
     */
    getStocks(skip, limit, warehouseId) {
        const pipelineStages = [];

        if (warehouseId) {
            pipelineStages.push({
                $match: { warehouseId: new mongoose.Types.ObjectId(warehouseId) }
            });
        }

        pipelineStages.push(...this.buildAggregationPipeline([
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    total: [{ $count: 'count' }]
                }
            }
        ]));

        return Stock.aggregate(pipelineStages).then(result => {
            const stocks = result[0].data;
            const total = result[0].total[0]?.count || 0;
            return { stocks, total };
        });
    }

    /**
     * Get stock by ID with latest price
     * 
     * @param {string} stockId 
     * @param {string} [coin] - Optional coin filter for price
     * @returns {Promise<Object|null>}
     */
    getStockById(stockId, coin = null) {
        const pipeline = [
            { $match: { _id: new mongoose.Types.ObjectId(stockId) } },
            ...this.buildAggregationPipeline([], coin)
        ];

        return Stock.aggregate(pipeline).then(result => result[0] || null);
    }

    /**
     * Get stock by product and warehouse ID
     * 
     * @param {string} productId 
     * @param {string} warehouseId
     * @returns {Promise<import('../models/Stock')|null>}
     */
    getStockByProductAndWarehouse(productId, warehouseId) {
        return Stock.findOne({ productId, warehouseId });
    }

    /**
     * Get stock by product ID with latest price
     * 
     * @param {string} productId 
     * @returns {Promise<Object|null>}
     */
    getStockByProductId(productId) {
        const pipeline = [
            { $match: { productId: new mongoose.Types.ObjectId(productId) } },
            ...this.buildAggregationPipeline()
        ];

        return Stock.aggregate(pipeline).then(result => result[0] || null);
    }

    /**
     * Get all stock entries for a product across all warehouses
     * 
     * @param {string} productId 
     * @returns {Promise<Array>}
     */
    getStocksByProductId(productId) {
        const pipeline = [
            { $match: { productId: new mongoose.Types.ObjectId(productId) } },
            ...this.buildAggregationPipeline()
        ];

        return Stock.aggregate(pipeline);
    }

    /**
     * Create a new stock
     *
     * @param {Object} stockData
     * @param {string} [stockData.createdBy]
     * @param {string} [userId] - User performing the action
     * @returns {Promise<import('../models/Stock')>}
     */
    createStock(stockData, userId = null) {
        return new Stock(stockData).save().then((stock) => {
            if (userId) {
                this._logMovement({
                    type: stockMovementEnum.initial,
                    quantity: stock.quantity,
                    previousQuantity: 0,
                    newQuantity: stock.quantity,
                    stock,
                    userId,
                });
            }
            return stock;
        });
    }

    /**
     * Update stock minQuantity
     *
     * @param {string} stockId
     * @param {number} minQuantity
     * @param {string} [userId] - User performing the action
     * @param {string} [reason] - Reason for adjustment
     * @returns {Promise<import('../models/Stock')|null>}
     */
    updateStock(stockId, minQuantity, userId = null, reason = null) {
        return Stock.findById(stockId).then((stock) => {
            if (!stock) return null;
            const previousMinQuantity = stock.minQuantity;
            return Stock.findByIdAndUpdate(
                stockId,
                { minQuantity },
                { new: true }
            ).populate('productId').then((updatedStock) => {
                if (userId && previousMinQuantity !== minQuantity) {
                    this._logMovement({
                        type: stockMovementEnum.adjust,
                        quantity: minQuantity - previousMinQuantity,
                        previousQuantity: previousMinQuantity,
                        newQuantity: minQuantity,
                        stock: updatedStock,
                        userId,
                        reason: reason || 'Min quantity adjustment',
                    });
                }
                return updatedStock;
            });
        });
    }

    /**
     * Add stock (increment quantity)
     *
     * @param {string} stockId
     * @param {number} amount
     * @param {string} [userId] - User performing the action
     * @param {string} [billId] - Optional bill reference
     * @returns {Promise<import('../models/Stock')>}
     */
    addStock(stockId, amount, userId = null, billId = null) {
        return Stock.findById(stockId).then((stock) => {
            if (!stock) return null;
            const previousQuantity = stock.quantity;
            return Stock.findByIdAndUpdate(
                stockId,
                { $inc: { quantity: amount } },
                { new: true }
            ).populate('productId').then((updatedStock) => {
                if (userId && updatedStock) {
                    this._logMovement({
                        type: stockMovementEnum.in,
                        quantity: amount,
                        previousQuantity,
                        newQuantity: previousQuantity + amount,
                        stock: updatedStock,
                        userId,
                        billId,
                    });
                }
                return updatedStock;
            });
        });
    }

    /**
     * Remove stock (decrement quantity, prevents negative and below minQuantity)
     * Uses atomic update to prevent race conditions
     *
     * @param {string} stockId
     * @param {number} amount
     * @param {string} [userId] - User performing the action
     * @param {string} [billId] - Optional bill reference
     * @param {string} [movementType] - Movement type (default: adjust)
     * @returns {Promise<import('../models/Stock')|null>}
     */
    removeStock(stockId, amount, userId = null, billId = null, movementType = stockMovementEnum.adjust) {
        return Stock.findOneAndUpdate(
            {
                _id: stockId,
                $expr: {
                    $and: [
                        { $gte: ["$quantity", amount] },
                        { $gte: [{ $subtract: ["$quantity", amount] }, "$minQuantity"] }
                    ]
                }
            },
            { $inc: { quantity: -amount } },
            { new: true }
        ).populate('productId').then((stock) => {
            if (stock && userId) {
                this._logMovement({
                    type: movementType,
                    quantity: amount,
                    previousQuantity: stock.quantity + amount,
                    newQuantity: stock.quantity,
                    stock,
                    userId,
                    billId,
                });
            }
            return stock;
        });
    }

    /**
     * Add stock by product and warehouse (creates if not exists)
     *
     * @param {string} productId
     * @param {string} warehouseId
     * @param {number} quantity
     * @param {string} createdBy
     * @param {string} [billId] - Optional bill reference
     * @returns {Promise<import('../models/Stock')>}
     */
    async addStockByProductAndWarehouse(productId, warehouseId, quantity, createdBy, billId = null) {
        let stock = await Stock.findOne({ productId, warehouseId });

        if (stock) {
            const previousQuantity = stock.quantity;
            stock = await Stock.findByIdAndUpdate(
                stock._id,
                { $inc: { quantity } },
                { new: true }
            );
            this._logMovement({
                type: stockMovementEnum.in,
                quantity,
                previousQuantity,
                newQuantity: previousQuantity + quantity,
                stock,
                userId: createdBy,
                billId,
            });
        } else {
            stock = new Stock({
                productId,
                warehouseId,
                quantity,
                createdBy,
            });
            stock = await stock.save();
            this._logMovement({
                type: stockMovementEnum.initial,
                quantity,
                previousQuantity: 0,
                newQuantity: quantity,
                stock,
                userId: createdBy,
            });
        }

        return stock;
    }
}

module.exports = StockService;
