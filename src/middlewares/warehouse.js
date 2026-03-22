const { validationResult } = require('express-validator');
const LoggerService = require('../services/LoggerService');

/**
 * Middleware to validate warehouse errors
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * 
 * @returns {void}
 */
const warehouseValidation = (req, res, next) => {
    const result = validationResult(req);
    const loggerService = LoggerService.getInstance();

    if (result.isEmpty()) {
        return next();
    }

    const errors = result.array();
    const reason = errors.map(error => error.msg).join(', ');

    loggerService.warn(
        'middleware@warehouseValidation',
        {
            requestId: req.requestId,
            userIp: req.userIp,
            body: req.body,
            reason,
            type: 'logic'
        }
    );

    res.status(400).json({
        code: 4000,
    });
}

/**
 * Middleware to validate warehouse ID exists
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * 
 * @returns {void}
 */
const validateWarehouseId = async (req, res, next) => {
    const { warehouseId } = req.body;
    const loggerService = LoggerService.getInstance();

    if (!warehouseId) {
        return next();
    }

    try {
        const WarehouseService = require('../services/WarehouseService');
        const exists = await WarehouseService.getInstance().warehouseExists(warehouseId);

        if (!exists) {
            loggerService.warn(
                'middleware@validateWarehouseId',
                {
                    requestId: req.requestId,
                    userIp: req.userIp,
                    body: req.body,
                    reason: 'Warehouse not found',
                    type: 'logic'
                }
            );

            return res.status(400).json({
                code: 4001,
            });
        }
    } catch (error) {
        loggerService.error('middleware@validateWarehouseId', {
            requestId: req.requestId,
            userIp: req.userIp,
            reason: error?.message ?? 'Unknown error',
            type: 'logic'
        });
        return res.status(500).json({ message: 'Internal error' });
    }

    next();
}

module.exports = {
    warehouseValidation,
    validateWarehouseId
};
