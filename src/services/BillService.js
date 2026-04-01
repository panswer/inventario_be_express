const { Types } = require('mongoose');
const Bill = require('../models/Bill');
const Product = require('../models/Product');

class BillService {
  /**
   * @type {BillService}
   */
  static instance;

  static getInstance() {
    if (!this.instance) {
      this.instance = new BillService();
    }

    return this.instance;
  }

  static destroyInstance() {
    delete this.instance;
  }

  /**
   * Create a new bill
   *
   * @param {string} userId
   * @returns {Promise<import('../models/Bill')>}
   */
  createBill(userId) {
    return new Bill({
      userId,
    }).save();
  }

  /**
   * Get bills with pagination
   *
   * @param {number} skip
   * @param {number} limit
   * @returns {Promise<Array<import('../models/Bill')>>}
   */
  getBills(skip, limit) {
    return Bill.find().skip(skip).limit(limit);
  }

  /**
   * Count total bills
   *
   * @returns {Promise<number>}
   */
  countBills() {
    return Bill.find().countDocuments();
  }

  /**
   * Get bill detail
   *
   * @param {string} billId - bill's id
   *
   * @returns {Promise<import('../models/Bill')>}
   */
  async getBillDetailById(billId) {
    const [billDetail] = await Bill.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(billId),
        },
      },
      {
        $lookup: {
          from: 'sales',
          localField: '_id',
          foreignField: 'billId',
          as: 'sales',
        },
      },
      {
        $addFields: {
          total: {
            $function: {
              body: 'function (sales) {return sales.map((sale) => sale.count * sale.price).reduce((prev, curr)=>prev+curr, 0)}',
              args: ['$sales'],
              lang: 'js',
            },
          },
        },
      },
    ]);

    await Product.populate(billDetail, { path: 'sales.productId' });

    return billDetail;
  }
}

module.exports = BillService;
