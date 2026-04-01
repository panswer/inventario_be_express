const LoggerService = require('../services/LoggerService');

/**
 * Middleware to catch general error
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {void}
 */
const errorManager = (err, req, res, next) => {
  const loggerService = LoggerService.getInstance();

  res.locals.errorMessage = err.message;

  loggerService.error('errorManager', {
    requestId: req.requestId,
    userIp: req.userIp,
    body: req.body,
    reason: err.message ?? 'unknown error',
    type: 'logic',
  });

  const status = err.status || 500;

  res.status(status).json({
    code: -1,
  });
};

module.exports = errorManager;
