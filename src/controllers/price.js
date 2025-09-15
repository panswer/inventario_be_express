const { coinEnum } = require("../enums/coinEnum");
const Price = require("../models/Price");

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

  let priceDb;
  try {
    priceDb = await Price.findOne({ productId });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "Price not found",
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

  let priceDb;
  try {
    priceDb = await Price.findOne({ _id: priceId, coin });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "Price not found",
    });
  }

  if (!priceDb) {
    return res.status(404).json({
      message: "Price not found",
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
      return res.status(400).json({
        message: "Coin type not valid",
      });
    }
  }

  try {
    await priceDb.save();
  } catch (error) {
    console.log(error);
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
