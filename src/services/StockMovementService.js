const mongoose = require("mongoose");
const StockMovement = require("../models/StockMovement");

class StockMovementService {
  static instance;

  /**
   * Get an instance
   * 
   * @returns {StockMovementService}
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new StockMovementService();
    }
    return this.instance;
  }

  static destroyInstance() {
    delete this.instance;
  }

  /**
   * Create a stock movement record
   *
   * @param {Object} movementData
   * @returns {Promise<import('../models/StockMovement')>}
   */
  createMovement(movementData) {
    const movement = new StockMovement(movementData);
    return movement.save();
  }

  /**
   * Log a stock movement
   *
   * @param {Object} params
   * @param {string} params.type - Movement type
   * @param {number} params.quantity - Quantity changed
   * @param {number} params.previousQuantity - Stock before movement
   * @param {number} params.newQuantity - Stock after movement
   * @param {string} params.productId
   * @param {string} params.warehouseId
   * @param {string} params.createdBy
   * @param {string} [params.billId] - Optional bill reference
   * @param {string} [params.reason] - For adjustments
   * @param {string} [params.transferToWarehouseId] - For transfers (source warehouse)
   * @param {string} [params.transferFromWarehouseId] - For transfers (destination warehouse)
   * @returns {Promise<import('../models/StockMovement')>}
   */
  logMovement({
    type,
    quantity,
    previousQuantity,
    newQuantity,
    productId,
    warehouseId,
    createdBy,
    billId = null,
    reason = null,
    transferToWarehouseId = null,
    transferFromWarehouseId = null,
  }) {
    return this.createMovement({
      type,
      quantity,
      previousQuantity,
      newQuantity,
      productId,
      warehouseId,
      billId,
      reason,
      transferToWarehouseId,
      transferFromWarehouseId,
      createdBy,
    });
  }

  /**
   * Get movements with pagination and filters
   *
   * @param {number} skip
   * @param {number} limit
   * @param {Object} [filters]
   * @param {string} [filters.productId]
   * @param {string} [filters.warehouseId]
   * @param {string} [filters.type]
   * @param {Date} [filters.startDate]
   * @param {Date} [filters.endDate]
   * @returns {Promise<{movements: Array, total: number}>}
   */
  getMovements(skip, limit, filters = {}) {
    const matchStage = {};

    if (filters.productId) {
      matchStage.productId = new mongoose.Types.ObjectId(filters.productId);
    }
    if (filters.warehouseId) {
      matchStage.warehouseId = new mongoose.Types.ObjectId(filters.warehouseId);
    }
    if (filters.type) {
      matchStage.type = filters.type;
    }
    if (filters.startDate || filters.endDate) {
      matchStage.createdAt = {};
      if (filters.startDate) {
        matchStage.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        matchStage.createdAt.$lte = new Date(filters.endDate);
      }
    }

    return StockMovement.aggregate([
      { $match: matchStage },
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "productId",
              },
            },
            { $unwind: "$productId" },
            {
              $lookup: {
                from: "warehouses",
                localField: "warehouseId",
                foreignField: "_id",
                as: "warehouseId",
              },
            },
            { $unwind: "$warehouseId" },
            {
              $lookup: {
                from: "bills",
                localField: "billId",
                foreignField: "_id",
                as: "billId",
              },
            },
            {
              $unwind: {
                path: "$billId",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "warehouses",
                localField: "transferToWarehouseId",
                foreignField: "_id",
                as: "transferToWarehouseId",
              },
            },
            {
              $unwind: {
                path: "$transferToWarehouseId",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "warehouses",
                localField: "transferFromWarehouseId",
                foreignField: "_id",
                as: "transferFromWarehouseId",
              },
            },
            {
              $unwind: {
                path: "$transferFromWarehouseId",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ]).then((result) => {
      const movements = result[0].data;
      const total = result[0].total[0]?.count || 0;
      return { movements, total };
    });
  }

  /**
   * Get all movements for a specific product
   *
   * @param {string} productId
   * @param {number} [limit=50]
   * @returns {Promise<Array>}
   */
  getMovementsByProductId(productId, limit = 50) {
    return StockMovement.find({ productId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("warehouseId")
      .populate("productId")
      .populate("billId")
      .populate("transferToWarehouseId")
      .populate("transferFromWarehouseId");
  }

  /**
   * Get movements for a product in a specific warehouse
   *
   * @param {string} productId
   * @param {string} warehouseId
   * @param {number} [limit=50]
   * @returns {Promise<Array>}
   */
  getMovementsByProductAndWarehouse(productId, warehouseId, limit = 50) {
    return StockMovement.find({ productId, warehouseId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("warehouseId")
      .populate("productId")
      .populate("billId")
      .populate("transferToWarehouseId")
      .populate("transferFromWarehouseId");
  }
}

module.exports = StockMovementService;
