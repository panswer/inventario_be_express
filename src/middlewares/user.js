const { validationResult } = require('express-validator');
const LoggerService = require('../services/LoggerService');

/**
 * Middleware to validate user errors
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {void}
 */
const userValidation = (req, res, next) => {
  const result = validationResult(req);
  const loggerService = LoggerService.getInstance();

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array();

  const reason = errors.map(error => error.msg).join(', ');

  loggerService.warn('middleware@userValidation', {
    requestId: req.requestId,
    userIp: req.userIp,
    body: req.body,
    reason,
    type: 'validation',
  });

  return res.status(400).json({
    message: reason,
  });
};

module.exports = { userValidation };
