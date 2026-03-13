const { errorText } = require("../utils/color");
const BillService = require("../services/BillService");
const SaleService = require("../services/SaleService");
const LoggerService = require("../services/LoggerService");

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

  const billService = BillService.getInstance();
  const saleService = SaleService.getInstance();
  const loggerService = LoggerService.getInstance();

  let billDb;
  try {
    billDb = await billService.createBill(user._id);
  } catch (e) {
    loggerService.error(
      "billService@createBill",
      {
        requestId: req.requestId,
        userIp: req.userIp,
        body: req.body,
        reason: e?.message ?? "Unknown error",
        type: 'logic'
      }
    );

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
    loggerService.error(
      'saleService@createSale',
      {
        requestId: req.requestId,
        userIp: req.userIp,
        body,
        reason: error?.message ?? 'Unknown error',
        type: 'logic'
      }
    );

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
  const loggerService = LoggerService.getInstance();

  let billDetail;
  try {
    billDetail = await billService.getBillDetailById(billId);
  } catch (e) {
    loggerService.error(
      'billService@getBillDetailById',
      {
        requestId: req.requestId,
        userIp: req.userIp,
        body: req.body,
        reason: e?.message ?? 'Unknown error',
        type: 'logic',
      }
    );
    return res.status(500).json({ message: "Unknown error" });
  }

  if (!billDetail) {
    loggerService.warn(
      'billService@getBillDetailById',
      {
        requestId: req.requestId,
        userIp: req.userIp,
        body: req.body,
        reason: "Bill not found",
        type: 'logic',
      }
    );
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
