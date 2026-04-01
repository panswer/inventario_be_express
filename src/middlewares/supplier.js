const { validationResult } = require('express-validator');
const LoggerService = require('../services/LoggerService');

const supplierValidation = (req, res, next) => {
  const result = validationResult(req);
  const loggerService = LoggerService.getInstance();

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array();
  const reason = errors.map(error => error.msg).join(', ');

  loggerService.warn('middleware@supplierValidation', {
    requestId: req.requestId,
    userIp: req.userIp,
    body: req.body,
    reason,
    type: 'logic',
  });

  res.status(400).json({
    code: 4000,
  });
};

module.exports = {
  supplierValidation,
};
