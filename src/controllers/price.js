const { coinEnum } = require('../enums/coinEnum');
const PriceService = require('../services/PriceService');
const LoggerService = require('../services/LoggerService');

/**
 * Get a list of coin
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const getPriceCoinAll = (req, res) => {
  res.status(200).json({
    coins: Object.values(coinEnum),
  });
};

/**
 * Update a price by id
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const getPriceByProductId = async (req, res) => {
  const productId = req.params.productId;
  const priceService = PriceService.getInstance();
  const loggerService = LoggerService.getInstance();

  let priceDb;
  try {
    priceDb = await priceService.getPriceByProductId(productId);
  } catch (error) {
    loggerService.error('priceService@getPriceByProductId', {
      requestId: req.requestId,
      userIp: req.userIp,
      body: req.body,
      reason: error?.message ?? 'Unknown error',
      type: 'logic',
    });
    return res.status(500).json({
      message: 'Unknown error',
    });
  }

  if (!priceDb) {
    loggerService.warn('priceService@getPriceByProductId', {
      requestId: req.requestId,
      userIp: req.userIp,
      body: req.body,
      reason: 'Price not found',
      type: 'logic',
    });
    return res.status(404).json({
      message: 'Price not found',
    });
  }

  return res.status(200).json({
    price: priceDb,
  });
};

/**
 * Update a price by id
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const updatePriceById = async (req, res) => {
  const priceId = req.params.priceId;
  const coin = req.params.coin;
  const priceService = PriceService.getInstance();
  const loggerService = LoggerService.getInstance();

  let priceDb;
  try {
    priceDb = await priceService.getPriceByIdAndCoin(priceId, coin);
  } catch (error) {
    loggerService.error('priceService@getPriceByIdAndCoin', {
      requestId: req.requestId,
      userIp: req.userIp,
      body: req.body,
      reason: error?.message ?? 'Unknown error',
      type: 'logic',
    });
    return res.status(404).json({
      message: 'Price not found',
    });
  }

  if (!priceDb) {
    loggerService.warn('priceService@getPriceByIdAndCoin', {
      requestId: req.requestId,
      userIp: req.userIp,
      body: req.body,
      reason: 'price not found',
      type: 'logic',
    });
    return res.status(404).json({
      message: 'Price not found',
    });
  }

  const { amount } = req.body;

  if (amount > 0.01) {
    priceDb.amount = amount;
  }

  if (coin) {
    if (Object.values(coinEnum).includes(coin)) {
      priceDb.coin = coin;
    } else {
      loggerService.warn('priceService@updatePriceById', {
        requestId: req.requestId,
        userIp: req.userIp,
        body: req.body,
        reason: 'Coin type not valid',
        type: 'logic',
      });
      return res.status(400).json({
        message: 'Coin type not valid',
      });
    }
  }

  try {
    await priceDb.save();
  } catch (error) {
    loggerService.error('priceService@updatePriceById', {
      requestId: req.requestId,
      userIp: req.userIp,
      body: req.body,
      reason: error?.message ?? 'Unknown error',
      type: 'logic',
    });
    return res.status(500).json({
      message: "Couldn't update price",
    });
  }

  res.status(202).json({
    price: priceDb,
  });
};

module.exports = {
  getPriceCoinAll,
  getPriceByProductId,
  updatePriceById,
};
