const { validationResult } = require('express-validator');
const LoggerService = require('../services/LoggerService');

/**
 * Middleware to validate price errors
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {void}
 */
const priceValidation = (req, res, next) => {
  const result = validationResult(req);
  const loggerService = LoggerService.getInstance();

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array();

  const reason = errors.map(error => error.msg).join(', ');

  loggerService.warn('middleware@priceValidation', {
    requestId: req.requestId,
    userIp: req.userIp,
    body: req.body,
    reason,
    type: 'logic',
  });

  res.status(400).json({
    code: 1002,
  });
};

module.exports = {
  priceValidation,
};
