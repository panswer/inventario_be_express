const Stock = require('../models/Stock');
const Price = require('../models/Price');
const LoggerService = require('../services/LoggerService');

/**
 * Middleware to validate sales before creating a bill
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * 
 * @returns {void}
 */
const salesValidation = async (req, res, next) => {
    const { sellers } = req.body;
    const loggerService = LoggerService.getInstance();

    if (!sellers || !Array.isArray(sellers) || sellers.length === 0) {
        loggerService.warn('middleware@salesValidation', {
            requestId: req.requestId,
            userIp: req.userIp,
            body: req.body,
            reason: "No sellers provided",
            type: 'logic'
        });
        return res.status(400).json({
            message: "Validation failed",
            errors: [{ reason: "No sellers provided" }],
        });
    }

    const errors = [];

    for (let i = 0; i < sellers.length; i++) {
        const sale = sellers[i];

        const stock = await Stock.findById(sale.stockId);
        if (!stock) {
            errors.push({ index: i, stockId: sale.stockId, reason: "Stock not found" });
            continue;
        }

        if (stock.quantity < sale.count) {
            errors.push({
                index: i,
                stockId: sale.stockId,
                reason: `Insufficient stock (available: ${stock.quantity}, requested: ${sale.count})`
            });
            continue;
        }

        const price = await Price.findOne({ productId: stock.productId, coin: sale.coin }).sort({ createdAt: -1 });
        if (!price) {
            errors.push({ index: i, stockId: sale.stockId, reason: "No price defined for this product" });
            continue;
        }

        if (price.coin !== sale.coin) {
            errors.push({
                index: i,
                stockId: sale.stockId,
                reason: `Coin mismatch (price in ${price.coin}, sale in ${sale.coin})`
            });
        }
    }

    if (errors.length > 0) {
        loggerService.warn('middleware@salesValidation', {
            requestId: req.requestId,
            userIp: req.userIp,
            body: req.body,
            reason: `Validation failed: ${errors.map(e => e.reason).join(', ')}`,
            type: 'logic'
        });
        return res.status(400).json({
            message: "Validation failed",
            errors,
        });
    }

    next();
};

module.exports = { salesValidation };