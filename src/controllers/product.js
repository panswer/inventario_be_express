const ProductService = require("../services/ProductService");
const PriceService = require("../services/PriceService");
const LoggerService = require("../services/LoggerService");
const mongoose = require("mongoose");

/**
 * Get product list
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const getProducts = async (req, res) => {
  const query = req.query;
  const page = query.page || "1";
  const limit = query.limit || "10";
  const categories = query.categories ? query.categories.split(',') : undefined;

  const skipItems = Number(page) - 1;
  const limitNum = Number(limit);

  const productService = ProductService.getInstance();

  const products = await productService.getProducts(skipItems, limitNum, categories);

  const total = await productService.countProducts(categories);

  return res.status(200).json({
    products,
    total,
  });
};

/**
 * Create a new product and price
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const createProduct = async (req, res) => {
  const body = req.body;
  const productService = ProductService.getInstance();
  const priceService = PriceService.getInstance();
  const loggerService = LoggerService.getInstance();

  const productData = {
    name: body.name,
    createdBy: body.session._id,
  };

  if (body.categories && body.categories.length > 0) {
    productData.categories = body.categories.map(id => new mongoose.Types.ObjectId(id));
  }

  let product;
  try {
    product = await productService.createProduct(productData);
  } catch (error) {
    loggerService.error(
      "productService@createProduct",
      {
        requestId: req.requestId,
        userIp: req.userIp,
        body: req.body,
        reason: error?.message ?? 'Unknown error',
        type: 'logic'
      }
    );
    return res.status(400).json({
      code: 2000,
    });
  }

  let price;
  try {
    price = await priceService.createPrice({
      amount: body.amount,
      coin: body.coin,
      productId: product._id,
      createdBy: body.session._id,
    });
  } catch (error) {
    loggerService.error(
      "priceService@createPrice",
      {
        requestId: req.requestId,
        userIp: req.userIp,
        body: req.body,
        reason: error?.message ?? 'Unknown error',
        type: 'logic'
      }
    );
    return res.status(400).json({
      code: 3000,
    });
  }

  res.status(201).json({
    product,
    price,
  });
};

/**
 * Get a product by id
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const getProductById = async (req, res) => {
  const productId = req.params.productId;
  const productService = ProductService.getInstance();
  const loggerService = LoggerService.getInstance();

  let productDb;
  try {
    productDb = await productService.getProductById(productId);
  } catch (error) {
    loggerService.error(
      'productService@getProductById',
      {
        requestId: req.requestId,
        userIp: req.user,
        body: req.body,
        reason: error?.message ?? 'Unknown error',
        type: 'logic'
      }
    );
    return res.status(404).json({
      message: "Product not found",
    });
  }

  res.status(200).json({
    product: productDb,
  });
};

/**
 * Update a product by id
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const updateProductById = async (req, res) => {
  const productId = req.params.productId;
  const productService = ProductService.getInstance();
  const loggerService = LoggerService.getInstance();

  let productDb;
  try {
    productDb = await productService.getProductById(productId);
  } catch (error) {
    loggerService.error(
      'productService@getProductById',
      {
        requestId: req.requestId,
        userIp: req.user,
        body: req.body,
        reason: error?.message ?? 'Unknown error',
        type: 'logic'
      }
    );
    return res.status(404).json({
      message: "Product not found",
    });
  }

  if (!productDb) {
    loggerService.warn(
      'productService@getProductById',
      {
        requestId: req.requestId,
        userIp: req.user,
        body: req.body,
        reason: "Product not found",
        type: 'logic'
      }
    );
    return res.status(404).json({
      message: "Product not found",
    });
  }

  const { inStock, name, categories } = req.body;

  if (typeof inStock === "boolean") {
    productDb.inStock = inStock;
  }

  if (name) {
    productDb.name = name;
  }

  if (categories && Array.isArray(categories)) {
    productDb.categories = categories.map(id => new mongoose.Types.ObjectId(id));
  }

  try {
    await productDb.save();
  } catch (error) {
    loggerService.error(
      'productService@updateProductById',
      {
        requestId: req.requestId,
        userIp: req.user,
        body: req.body,
        reason: error?.message ?? 'Unknown error',
        type: 'logic'
      }
    );
    return res.status(500).json({
      message: "Internal error",
    });
  }

  res.status(200).json(productDb);
};

module.exports = {
  getProducts,
  createProduct,
  getProductById,
  updateProductById,
};
