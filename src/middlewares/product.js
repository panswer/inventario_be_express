const { validationResult, body } = require('express-validator');
const LoggerService = require('../services/LoggerService');
const ProductService = require('../services/ProductService');

/**
 * Middleware to validate product error
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {void}
 */
const productValidation = (req, res, next) => {
  const result = validationResult(req);
  const loggerService = LoggerService.getInstance();

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array();

  const reason = errors.map(error => error.msg).join(', ');

  loggerService.warn('middleware@productValidation', {
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

const productBarcodeValidation = body('barcode').custom(async (value, { req }) => {
  if (!value) return true;
  const productService = ProductService.getInstance();
  const existing = await productService.findByBarcode(value);

  if (!req.params.productId && existing) {
    throw new Error('El código de barras ya está registrado');
  }

  if (existing && existing._id.toString() !== req.params.productId) {
    throw new Error('El código de barras ya está registrado');
  }

  return true;
});

module.exports = {
  productValidation,
  productBarcodeValidation,
};
