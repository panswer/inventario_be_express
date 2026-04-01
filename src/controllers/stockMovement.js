const StockMovementService = require('../services/StockMovementService');
const LoggerService = require('../services/LoggerService');

/**
 * Get stock movements with pagination
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getMovements = async (req, res) => {
  const { page, limit, productId, warehouseId, type, startDate, endDate } = req.query;
  const stockMovementService = StockMovementService.getInstance();

  const skipItems = Number(page) - 1 || 0;
  const limitNum = Number(limit) || 50;

  const filters = {};
  if (productId) filters.productId = productId;
  if (warehouseId) filters.warehouseId = warehouseId;
  if (type) filters.type = type;
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  try {
    const { movements, total } = await stockMovementService.getMovements(
      skipItems,
      limitNum,
      filters
    );
    return res.status(200).json({ movements, total });
  } catch (error) {
    const loggerService = LoggerService.getInstance();
    loggerService.error('stockMovementService@getMovements', {
      requestId: req.requestId,
      userIp: req.userIp,
      reason: error?.message ?? 'Unknown error',
      type: 'logic',
    });
    return res.status(500).json({ message: 'Internal error' });
  }
};

/**
 * Get movements by product ID
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getMovementsByProduct = async (req, res) => {
  const { productId } = req.params;
  const { limit } = req.query;
  const stockMovementService = StockMovementService.getInstance();
  const loggerService = LoggerService.getInstance();

  try {
    const movements = await stockMovementService.getMovementsByProductId(
      productId,
      Number(limit) || 50
    );
    return res.status(200).json({ movements });
  } catch (error) {
    loggerService.error('stockMovementService@getMovementsByProduct', {
      requestId: req.requestId,
      userIp: req.userIp,
      reason: error?.message ?? 'Unknown error',
      type: 'logic',
    });
    return res.status(500).json({ message: 'Internal error' });
  }
};

/**
 * Get movements by product and warehouse
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getMovementsByProductAndWarehouse = async (req, res) => {
  const { productId, warehouseId } = req.params;
  const { limit } = req.query;
  const stockMovementService = StockMovementService.getInstance();
  const loggerService = LoggerService.getInstance();

  try {
    const movements = await stockMovementService.getMovementsByProductAndWarehouse(
      productId,
      warehouseId,
      Number(limit) || 50
    );
    return res.status(200).json({ movements });
  } catch (error) {
    loggerService.error('stockMovementService@getMovementsByProductAndWarehouse', {
      requestId: req.requestId,
      userIp: req.userIp,
      reason: error?.message ?? 'Unknown error',
      type: 'logic',
    });
    return res.status(500).json({ message: 'Internal error' });
  }
};

module.exports = {
  getMovements,
  getMovementsByProduct,
  getMovementsByProductAndWarehouse,
};
