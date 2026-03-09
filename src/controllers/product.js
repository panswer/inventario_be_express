const ProductService = require("../services/ProductService");
const PriceService = require("../services/PriceService");

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

  const skipItems = Number(page) - 1;
  const limitNum = Number(limit);

  const productService = ProductService.getInstance();

  const products = await productService.getProducts(skipItems, limitNum);

  const total = await productService.countProducts();

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

  let product;
  try {
    product = await productService.createProduct({
      name: body.name,
      createdBy: body.session._id,
    });
  } catch (error) {
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

  let productDb;
  try {
    productDb = await productService.getProductById(productId);
  } catch (error) {
    console.log(error);
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

  let productDb;
  try {
    productDb = await productService.getProductById(productId);
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "Product not found",
    });
  }

  if (!productDb) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  const { inStock, name } = req.body;

  if (typeof inStock === "boolean") {
    productDb.inStock = inStock;
  }

  if (name) {
    if (typeof name === "string" && name.length > 2) {
      productDb.name = name;
    } else {
      return res.status(400).json({
        message: "Name is not valid",
      });
    }
  }

  try {
    await productDb.save();
  } catch (error) {
    console.log(error);
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
