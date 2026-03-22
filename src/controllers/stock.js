const StockService = require("../services/StockService");
const LoggerService = require("../services/LoggerService");

/**
 * Get all stocks with pagination
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const getStocks = async (req, res) => {
    const query = req.query;
    const page = query.page || "1";
    const limit = query.limit || "10";
    const warehouseId = query.warehouseId;

    const skipItems = Number(page) - 1;
    const limitNum = Number(limit);

    const stockService = StockService.getInstance();

    const { stocks, total } = await stockService.getStocks(skipItems, limitNum, warehouseId);

    return res.status(200).json({
        stocks,
        total,
    });
};

/**
 * Get stock by ID
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const getStockById = async (req, res) => {
    const stockId = req.params.stockId;
    const stockService = StockService.getInstance();
    const loggerService = LoggerService.getInstance();

    let stockDb;
    try {
        stockDb = await stockService.getStockById(stockId);
    } catch (error) {
        loggerService.error(
            'stockService@getStockById',
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: error?.message ?? 'Unknown error',
                type: 'logic'
            }
        );
        return res.status(404).json({
            message: "Stock not found",
        });
    }

    if (!stockDb) {
        loggerService.warn(
            'stockService@getStockById',
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: "Stock not found",
                type: 'logic'
            }
        );
        return res.status(404).json({
            message: "Stock not found",
        });
    }

    return res.status(200).json({
        stock: stockDb,
    });
};

/**
 * Get stock by product ID
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const getStockByProductId = async (req, res) => {
    const productId = req.params.productId;
    const stockService = StockService.getInstance();
    const loggerService = LoggerService.getInstance();

    let stockDb;
    try {
        stockDb = await stockService.getStockByProductId(productId);
    } catch (error) {
        loggerService.error(
            'stockService@getStockByProductId',
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: error?.message ?? 'Unknown error',
                type: 'logic'
            }
        );
        return res.status(500).json({
            code: 4000,
        });
    }

    if (!stockDb) {
        return res.status(404).json({
            message: "Stock not found",
        });
    }

    return res.status(200).json({
        stock: stockDb,
    });
};

/**
 * Create a new stock
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const createStock = async (req, res) => {
    const body = req.body;
    const stockService = StockService.getInstance();
    const loggerService = LoggerService.getInstance();

    const stockData = {
        productId: body.productId,
        warehouseId: body.warehouseId,
        quantity: body.quantity || 0,
        minQuantity: body.minQuantity || 0,
        createdBy: body.session._id,
    };

    let stock;
    try {
        stock = await stockService.createStock(stockData);
    } catch (error) {
        loggerService.error(
            'stockService@createStock',
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: error?.message ?? 'Unknown error',
                type: 'logic'
            }
        );
        return res.status(400).json({
            code: 4000,
        });
    }

    res.status(201).json({
        stock,
    });
};

/**
 * Update stock minQuantity
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const updateStock = async (req, res) => {
    const stockId = req.params.stockId;
    const body = req.body;
    const stockService = StockService.getInstance();
    const loggerService = LoggerService.getInstance();

    const minQuantity = body.minQuantity;

    let stockDb;
    try {
        stockDb = await stockService.updateStock(stockId, minQuantity);
    } catch (error) {
        loggerService.error(
            'stockService@updateStock',
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: error?.message ?? 'Unknown error',
                type: 'logic'
            }
        );
        return res.status(400).json({
            code: 4000,
        });
    }

    if (!stockDb) {
        return res.status(404).json({
            message: "Stock not found",
        });
    }

    res.status(200).json({
        stock: stockDb,
    });
};

/**
 * Add stock (increment quantity)
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const addStock = async (req, res) => {
    const stockId = req.params.stockId;
    const body = req.body;
    const stockService = StockService.getInstance();
    const loggerService = LoggerService.getInstance();

    let stockDb;
    try {
        stockDb = await stockService.addStock(stockId, body.amount);
    } catch (error) {
        loggerService.error(
            'stockService@addStock',
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: error?.message ?? 'Unknown error',
                type: 'logic'
            }
        );
        return res.status(400).json({
            code: 4000,
        });
    }

    if (!stockDb) {
        loggerService.warn(
            'stockService@addStock',
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: 'Stock not found',
                type: 'logic'
            }
        );
        return res.status(404).json({
            message: "Stock not found",
        });
    }

    res.status(200).json({
        stock: stockDb,
    });
};

/**
 * Remove stock (decrement quantity)
 * Cannot go below 0 or minQuantity
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const removeStock = async (req, res) => {
    const stockId = req.params.stockId;
    const body = req.body;
    const stockService = StockService.getInstance();
    const loggerService = LoggerService.getInstance();

    let stockDb;
    try {
        stockDb = await stockService.removeStock(stockId, body.amount);
    } catch (error) {
        loggerService.error(
            'stockService@removeStock',
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: error?.message ?? 'Unknown error',
                type: 'logic'
            }
        );
        return res.status(400).json({
            code: 4000,
        });
    }

    if (!stockDb) {
        loggerService.warn(
            'stockService@removeStock',
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: 'Stock not found or would go below minimum',
                type: 'logic'
            }
        );
        return res.status(400).json({
            code: 4002,
            message: "Cannot remove: would go below minimum stock",
        });
    }

    res.status(200).json({
        stock: stockDb,
    });
};

module.exports = {
    getStocks,
    getStockById,
    getStockByProductId,
    createStock,
    updateStock,
    addStock,
    removeStock,
};
