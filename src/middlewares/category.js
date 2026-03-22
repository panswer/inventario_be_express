const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const LoggerService = require('../services/LoggerService');
const CategoryService = require('../services/CategoryService');

/**
 * Middleware to validate category errors
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * 
 * @returns {void}
 */
const categoryValidation = (req, res, next) => {
    const result = validationResult(req);
    const loggerService = LoggerService.getInstance();

    if (result.isEmpty()) {
        return next();
    }

    const errors = result.array();

    const reason = errors.map(error => error.msg).join(', ');

    loggerService.warn(
        'middleware@categoryValidation',
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
};

/**
 * Middleware to validate category IDs exist in database
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * 
 * @returns {void}
 */
const validateCategories = async (req, res, next) => {
    let { categories } = req.body;
    const loggerService = LoggerService.getInstance();

    if (typeof categories === 'string' && categories.length > 0) {
        categories = categories.split(',').map(id => id.trim()).filter(id => id);
    }

    req.body.categories = categories;

    if (!categories || !categories.length) {
        return next();
    }

    const categoryService = CategoryService.getInstance();

    try {
        const validCategories = await categoryService.getCategoriesByIds(categories);

        if (validCategories.length !== categories.length) {
            const validIds = validCategories.map(c => c._id.toString());
            const invalidIds = categories.filter(id => !validIds.includes(id));

            loggerService.warn(
                'middleware@validateCategories',
                {
                    requestId: req.requestId,
                    userIp: req.userIp,
                    body: req.body,
                    reason: `Invalid category IDs: ${invalidIds.join(', ')}`,
                    type: 'logic'
                }
            );
            return res.status(400).json({
                code: 4003,
            });
        }

        return next();
    } catch (error) {
        loggerService.error(
            'middleware@validateCategories',
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: error?.message ?? 'Unknown error',
                type: 'logic'
            }
        );
        return res.status(500).json({
            message: "Internal error",
        });
    }
};

module.exports = {
    categoryValidation,
    validateCategories
};
