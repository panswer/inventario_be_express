const { Types } = require("mongoose");
const Bill = require("../models/Bill");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const { errorText } = require("../utils/color");

/**
 * Create a bill
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const createBill = async (req, res) => {
  const body = req.body;
  /**
   * @type {import('../models/User').UserSchema}
   */
  const user = body.session;
  /**
   * @type {Array<import('../models/Sale').SaleRequest>}
   */
  const sellers = body.sellers;

  const newBill = new Bill({
    userId: user._id,
  });

  let billDb;
  try {
    billDb = await newBill.save();
  } catch (e) {
    console.log(errorText(e.message));

    return res.status(500).json({
      message: "Unknown error",
    });
  }

  try {
    await Promise.all(
      sellers.map((sale) =>
        new Sale({
          billId: billDb._id,
          coin: sale.coin,
          count: sale.count,
          price: sale.price,
          productId: sale.productId,
        }).save()
      )
    );
  } catch (error) {
    console.log(errorText(e.message));

    return res.status(500).json({
      message: "Unknown error",
    });
  }

  res.status(201).json({
    ok: true,
  });
};

/**
 * Get all bills
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const getAllBills = async (req, res) => {
  const query = req.query;
  const limit = query.limit || "10";
  const page = query.page || "1";

  const limitNum = Number(limit);
  const skipItems = (Number(page) - 1) * limitNum;

  const bills = await Bill.find().skip(skipItems).limit(limitNum);

  const total = await Bill.find().countDocuments();

  res.status(200).json({
    bills: JSON.parse(JSON.stringify(bills)),
    total,
  });
};

/**
 * Get bill detail by billId
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const getBillDetailByBillId = async (req, res) => {
  const { billId } = req.params;

  const [billDetail] = await Bill.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(billId),
      },
    },
    {
      $lookup: {
        from: "sales",
        localField: "_id",
        foreignField: "billId",
        as: "sales",
      },
    },
    {
      $addFields: {
        total: {
          $function: {
            body: "function (sales) {return sales.map((sale) => sale.count * sale.price).reduce((prev, curr)=>prev+curr)}",
            args: ["$sales"],
            lang: "js",
          },
        },
      },
    },
  ]);

  await Product.populate(billDetail, { path: "sales.productId" });

  res.status(200).json({
    billDetail,
  });
};

module.exports = {
  createBill,
  getAllBills,
  getBillDetailByBillId,
};
