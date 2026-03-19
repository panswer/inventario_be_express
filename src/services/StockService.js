const mongoose = require('mongoose');
const Stock = require('../models/Stock');

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
     * Build aggregation pipeline with latest price lookup
     * 
     * @param {Array} pipeline - Additional pipeline stages
     * @returns {Array}
     */
    buildAggregationPipeline(pipeline = []) {
        return [
            { $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'productId'
            }},
            { $unwind: '$productId' },
            { $lookup: {
                from: 'categories',
                let: { catIds: '$productId.categories' },
                pipeline: [
                    { $match: { 
                        $expr: { $in: ['$_id', '$$catIds'] }
                    }}
                ],
                as: 'productId.categories'
            }},
            { $lookup: {
                from: 'prices',
                let: { pid: '$productId._id' },
                pipeline: [
                    { $match: { 
                        $expr: { $eq: ['$productId', '$$pid'] }
                    }},
                    { $sort: { createdAt: -1 } },
                    { $limit: 1 }
                ],
                as: 'price'
            }},
            { $unwind: {
                path: '$price',
                preserveNullAndEmptyArrays: true
            }},
            ...pipeline
        ];
    }

    /**
     * Get stocks with pagination and latest price
     * 
     * @param {number} skip 
     * @param {number} limit 
     * @returns {Promise<{stocks: Array, total: number}>}
     */
    getStocks(skip, limit) {
        const pipeline = this.buildAggregationPipeline([
            { $facet: {
                data: [{ $skip: skip }, { $limit: limit }],
                total: [{ $count: 'count' }]
            }}
        ]);

        return Stock.aggregate(pipeline).then(result => {
            const stocks = result[0].data;
            const total = result[0].total[0]?.count || 0;
            return { stocks, total };
        });
    }

    /**
     * Get stock by ID with latest price
     * 
     * @param {string} stockId 
     * @returns {Promise<Object|null>}
     */
    getStockById(stockId) {
        const pipeline = [
            { $match: { _id: new mongoose.Types.ObjectId(stockId) } },
            ...this.buildAggregationPipeline()
        ];

        return Stock.aggregate(pipeline).then(result => result[0] || null);
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
     * Create a new stock
     * 
     * @param {Object} stockData 
     * @returns {Promise<import('../models/Stock')>}
     */
    createStock(stockData) {
        return new Stock(stockData).save();
    }

    /**
     * Update stock minQuantity
     * 
     * @param {string} stockId 
     * @param {number} minQuantity 
     * @returns {Promise<import('../models/Stock')|null>}
     */
    updateStock(stockId, minQuantity) {
        return Stock.findByIdAndUpdate(
            stockId,
            { minQuantity },
            { new: true }
        ).populate('productId');
    }

    /**
     * Add stock (increment quantity)
     * 
     * @param {string} stockId 
     * @param {number} amount 
     * @returns {Promise<import('../models/Stock')>}
     */
    addStock(stockId, amount) {
        return Stock.findByIdAndUpdate(
            stockId,
            { $inc: { quantity: amount } },
            { new: true }
        ).populate('productId');
    }

    /**
     * Remove stock (decrement quantity, prevents negative and below minQuantity)
     * Uses atomic update to prevent race conditions
     * 
     * @param {string} stockId 
     * @param {number} amount 
     * @returns {Promise<import('../models/Stock')|null>}
     */
    removeStock(stockId, amount) {
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
        ).populate('productId');
    }
}

module.exports = StockService;
