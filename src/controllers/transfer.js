const TransferService = require('../services/TransferService');
const LoggerService = require('../services/LoggerService');

/**
 * Transfer stock between warehouses
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const transferStock = async (req, res) => {
  const { productId, fromWarehouseId, toWarehouseId, quantity } = req.body;
  const { session } = req.body;
  const transferService = TransferService.getInstance();
  const loggerService = LoggerService.getInstance();

  try {
    const result = await transferService.transferStock(
      productId,
      fromWarehouseId,
      toWarehouseId,
      quantity,
      session._id
    );

    return res.status(200).json(result);
  } catch (error) {
    loggerService.error('transferService@transferStock', {
      requestId: req.requestId,
      userIp: req.userIp,
      body: req.body,
      reason: error?.message ?? 'Unknown error',
      type: 'logic',
    });
    return res.status(400).json({
      code: error?.code ?? 4000,
      message: error?.message,
    });
  }
};

/**
 * Get stock by product across all warehouses
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getProductStockByWarehouse = async (req, res) => {
  const { productId } = req.params;
  const transferService = TransferService.getInstance();
  const loggerService = LoggerService.getInstance();

  try {
    const stocks = await transferService.getProductStockByWarehouse(productId);
    return res.status(200).json({ stocks });
  } catch (error) {
    loggerService.error('transferService@getProductStockByWarehouse', {
      requestId: req.requestId,
      userIp: req.userIp,
      reason: error?.message ?? 'Unknown error',
      type: 'logic',
    });
    return res.status(500).json({ message: 'Internal error' });
  }
};

module.exports = {
  transferStock,
  getProductStockByWarehouse,
};
