const Product = require("../models/Product");
const Price = require("../models/Price");

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

  const products = await Product.find().skip(skipItems).limit(limitNum);

  products.forEach((product) => {
    console.log({
      product,
      time: typeof product.createdAt.getTime(),
    });
  });

  const total = await Product.find().countDocuments();

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

  const newProduct = new Product({
    name: body.name,
    createdBy: body.session._id,
  });

  let product;
  try {
    product = await newProduct.save();
  } catch (error) {
    return res.status(400).json({
      code: 2000,
    });
  }

  const newPrice = new Price({
    amount: body.amount,
    coin: body.coin,
    productId: product._id,
    createdBy: body.session._id,
  });

  let price;
  try {
    price = await newPrice.save();
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

  let productDb;
  try {
    productDb = await Product.findById(productId);
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

  let productDb;
  try {
    productDb = await Product.findById(productId);
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
