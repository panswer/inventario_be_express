const { errorText } = require("../utils/color");
const BillService = require("../services/BillService");
const SaleService = require("../services/SaleService");

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

  if (!sellers || !Array.isArray(sellers) || sellers.length === 0) {
    return res.status(400).json({
      message: "sellers is required and must be a non-empty array",
    });
  }

  const billService = BillService.getInstance();
  const saleService = SaleService.getInstance();

  let billDb;
  try {
    billDb = await billService.createBill(user._id);
  } catch (e) {
    console.log(errorText(e.message));

    return res.status(500).json({
      message: "Unknown error",
    });
  }

  try {
    await Promise.all(
      sellers.map(sale => saleService.createSale({
        billId: billDb._id,
        coin: sale.coin,
        count: sale.count,
        price: sale.price,
        productId: sale.productId,
      }))
    );
  } catch (error) {
    console.log(errorText(error.message));

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

  const billService = BillService.getInstance();

  const bills = await billService.getBills(skipItems, limitNum);

  const total = await billService.countBills();

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
  const billService = BillService.getInstance();

  let billDetail;
  try {
    billDetail = await billService.getBillDetailById(billId);
  } catch (e) {
    console.log(errorText(e.message));
    return res.status(500).json({ message: "Unknown error" });
  }

  if (!billDetail) {
    return res.status(404).json({ message: "Bill not found" });
  }

  res.status(200).json({
    billDetail,
  });
};

module.exports = {
  createBill,
  getAllBills,
  getBillDetailByBillId,
};
