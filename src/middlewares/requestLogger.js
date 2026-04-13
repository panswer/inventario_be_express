const { randomUUID } = require('node:crypto');
const LoggerService = require('../services/LoggerService');

/**
 * Middleware to logger request
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {void}
 */
const requestLoggerMiddleware = (req, res, next) => {
  const loggerService = LoggerService.getInstance();
  const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const requestId = randomUUID();
  const start = Date.now();

  req.requestId = requestId;
  req.userIp = userIp;

  loggerService.info(`${req.method} ${req.url}`, {
    type: 'in',
    requestId,
    userIp,
    method: req.method,
    path: req.url,
    body: { ...req.body },
  });

  res.on('finish', () => {
    const duration = Date.now() - start;

    if (res.statusCode >= 400) {
      loggerService.error(`${req.method} ${req.url}`, {
        type: 'out',
        requestId,
        userIp,
        method: req.method,
        path: req.url,
        statusCode: res.statusCode,
        duration: duration,
        body: req.body,
        errorMessage: res.locals.errorMessage || null,
      });
    } else {
      loggerService.info(`${req.method} ${req.url}`, {
        type: 'out',
        requestId,
        userIp,
        method: req.method,
        path: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        body: req.body,
        errorMessage: res.locals.errorMessage || null,
      });
    }
  });

  next();
};

module.exports = requestLoggerMiddleware;
