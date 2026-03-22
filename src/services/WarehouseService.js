const mongoose = require("mongoose");
const Warehouse = require("../models/Warehouse");

class WarehouseService {
  static instance;

  static getInstance() {
    if (!this.instance) {
      this.instance = new WarehouseService();
    }
    return this.instance;
  }

  static destroyInstance() {
    delete this.instance;
  }

  /**
   * @param {number} skip
   * @param {number} limit
   * @returns {Promise<Array<import('../models/Warehouse')>>}
   */
  getWarehouses(skip, limit) {
    return Warehouse.find({ isEnabled: true })
      .populate("createdBy")
      .skip(skip)
      .limit(limit);
  }

  /**
   * @param {Array<string>} [filter]
   * @returns {Promise<number>}
   */
  countWarehouses(filter) {
    const query = filter?.length ? { _id: { $in: filter }, isEnabled: true } : { isEnabled: true };
    return Warehouse.countDocuments(query);
  }

  /**
   * @param {string} warehouseId
   * @returns {Promise<import('../models/Warehouse') | null>}
   */
  getWarehouseById(warehouseId) {
    return Warehouse.findOne({ _id: warehouseId, isEnabled: true });
  }

  /**
   * @param {string} name
   * @param {string} address
   * @param {string} createdBy
   * @returns {Promise<import('../models/Warehouse')>}
   */
  createWarehouse(name, address, createdBy) {
    const warehouse = new Warehouse({
      name,
      address,
      createdBy,
    });
    return warehouse.save();
  }

  /**
   * @param {string} warehouseId
   * @param {object} data
   * @param {string} [data.name]
   * @param {string} [data.address]
   * @param {boolean} [data.isEnabled]
   * @returns {Promise<import('../models/Warehouse') | null>}
   */
  updateWarehouse(warehouseId, data) {
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.isEnabled !== undefined) updateData.isEnabled = data.isEnabled;

    return Warehouse.findOneAndUpdate(
      { _id: warehouseId, isEnabled: true },
      updateData,
      { new: true }
    );
  }

  /**
   * @param {string} warehouseId
   * @returns {Promise<import('../models/Warehouse') | null>}
   */
  deleteWarehouse(warehouseId) {
    return Warehouse.findOneAndUpdate(
      { _id: warehouseId, isEnabled: true },
      { isEnabled: false },
      { new: true }
    );
  }

  /**
   * @param {string} warehouseId
   * @returns {Promise<boolean>}
   */
  async warehouseExists(warehouseId) {
    const count = await Warehouse.countDocuments({ _id: warehouseId, isEnabled: true });
    return count > 0;
  }
}

module.exports = WarehouseService;
