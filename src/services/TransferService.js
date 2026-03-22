const mongoose = require("mongoose");
const Stock = require("../models/Stock");
const WarehouseService = require("./WarehouseService");
const Product = require("../models/Product");

class TransferService {
  static instance;

  static getInstance() {
    if (!this.instance) {
      this.instance = new TransferService();
    }
    return this.instance;
  }

  static destroyInstance() {
    delete this.instance;
  }

  async transferStock(productId, fromWarehouseId, toWarehouseId, quantity, userId) {
    const warehouseService = WarehouseService.getInstance();

    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      const error = new Error("Product not found");
      error.code = 2000;
      throw error;
    }

    const fromWarehouseExists = await warehouseService.warehouseExists(fromWarehouseId);
    if (!fromWarehouseExists) {
      const error = new Error("Source warehouse not found");
      error.code = 4001;
      throw error;
    }

    const toWarehouseExists = await warehouseService.warehouseExists(toWarehouseId);
    if (!toWarehouseExists) {
      const error = new Error("Destination warehouse not found");
      error.code = 4002;
      throw error;
    }

    if (fromWarehouseId === toWarehouseId) {
      const error = new Error("Source and destination warehouses must be different");
      error.code = 4003;
      throw error;
    }

    if (quantity <= 0) {
      const error = new Error("Quantity must be greater than 0");
      error.code = 4004;
      throw error;
    }

    try {
      return await this._transferWithTransaction(productId, fromWarehouseId, toWarehouseId, quantity, userId);
    } catch (error) {
      if (error.code === 251 || error.message?.includes("Transaction numbers")) {
        return this._transferWithoutTransaction(productId, fromWarehouseId, toWarehouseId, quantity, userId);
      }
      throw error;
    }
  }

  async _transferWithTransaction(productId, fromWarehouseId, toWarehouseId, quantity, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const fromStock = await Stock.findOneAndUpdate(
        {
          productId,
          warehouseId: fromWarehouseId,
          $expr: { $gte: ["$quantity", quantity] }
        },
        { $inc: { quantity: -quantity } },
        { new: true, session }
      );

      if (!fromStock) {
        const stock = await Stock.findOne({ productId, warehouseId: fromWarehouseId });
        const error = new Error(
          stock 
            ? "Insufficient stock in source warehouse" 
            : "Stock not found in source warehouse"
        );
        error.code = 4005;
        throw error;
      }

      let toStock = await Stock.findOne({ productId, warehouseId: toWarehouseId });

      if (toStock) {
        toStock = await Stock.findByIdAndUpdate(
          toStock._id,
          { $inc: { quantity } },
          { new: true, session }
        );
      } else {
        toStock = new Stock({
          productId,
          warehouseId: toWarehouseId,
          quantity,
          createdBy: userId
        });
        toStock = await toStock.save({ session });
      }

      await session.commitTransaction();

      return this._populateStocks(fromStock._id, toStock._id);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async _transferWithoutTransaction(productId, fromWarehouseId, toWarehouseId, quantity, userId) {
    const fromStock = await Stock.findOneAndUpdate(
      {
        productId,
        warehouseId: fromWarehouseId,
        $expr: { $gte: ["$quantity", quantity] }
      },
      { $inc: { quantity: -quantity } },
      { new: true }
    );

    if (!fromStock) {
      const stock = await Stock.findOne({ productId, warehouseId: fromWarehouseId });
      const error = new Error(
        stock 
          ? "Insufficient stock in source warehouse" 
          : "Stock not found in source warehouse"
      );
      error.code = 4005;
      throw error;
    }

    let toStock = await Stock.findOne({ productId, warehouseId: toWarehouseId });

    if (toStock) {
      toStock = await Stock.findByIdAndUpdate(
        toStock._id,
        { $inc: { quantity } },
        { new: true }
      );
    } else {
      toStock = new Stock({
        productId,
        warehouseId: toWarehouseId,
        quantity,
        createdBy: userId
      });
      toStock = await toStock.save();
    }

    return this._populateStocks(fromStock._id, toStock._id);
  }

  async _populateStocks(fromStockId, toStockId) {
    const populatedFromStock = await Stock.findById(fromStockId)
      .populate("productId")
      .populate("warehouseId");
    const populatedToStock = await Stock.findById(toStockId)
      .populate("productId")
      .populate("warehouseId");

    return { fromStock: populatedFromStock, toStock: populatedToStock };
  }

  async getProductStockByWarehouse(productId) {
    const stocks = await Stock.find({ productId })
      .populate("warehouseId")
      .populate("productId");
    
    return stocks.filter(s => s.warehouseId?.isEnabled);
  }
}

module.exports = TransferService;
