const WarehouseService = require("../services/WarehouseService");
const LoggerService = require("../services/LoggerService");

/**
 * Get warehouse list
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getWarehouses = async (req, res) => {
  const { page, limit } = req.query;
  const warehouseService = WarehouseService.getInstance();
  const loggerService = LoggerService.getInstance();

  try {
    const skipItems = Number(page || "1") - 1;
    const limitNum = Number(limit || "10");

    const warehouses = await warehouseService.getWarehouses(skipItems, limitNum);
    
    const total = await warehouseService.countWarehouses();

    return res.status(200).json({ warehouses, total });
  } catch (error) {
    loggerService.error("warehouseService@getWarehouses", {
      requestId: req.requestId,
      userIp: req.userIp,
      reason: error?.message ?? "Unknown error",
      type: "logic"
    });
    return res.status(500).json({ message: "Internal error" });
  }
};

/**
 * Get warehouse by ID
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getWarehouseById = async (req, res) => {
  const { warehouseId } = req.params;
  const warehouseService = WarehouseService.getInstance();
  const loggerService = LoggerService.getInstance();

  try {
    const warehouse = await warehouseService.getWarehouseById(warehouseId);

    if (!warehouse) {
      return res.status(404).json({ code: 4000 });
    }

    return res.status(200).json({ warehouse });
  } catch (error) {
    loggerService.error("warehouseService@getWarehouseById", {
      requestId: req.requestId,
      userIp: req.userIp,
      reason: error?.message ?? "Unknown error",
      type: "logic"
    });
    return res.status(500).json({ message: "Internal error" });
  }
};

/**
 * Create a warehouse
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const createWarehouse = async (req, res) => {
  const { name, address } = req.body;
  const { session } = req.body;
  const warehouseService = WarehouseService.getInstance();
  const loggerService = LoggerService.getInstance();

  try {
    const warehouse = await warehouseService.createWarehouse(
      name,
      address,
      session._id
    );

    return res.status(201).json({ warehouse });
  } catch (error) {
    loggerService.error("warehouseService@createWarehouse", {
      requestId: req.requestId,
      userIp: req.userIp,
      body: req.body,
      reason: error?.message ?? "Unknown error",
      type: "logic"
    });
    return res.status(400).json({ code: 4000 });
  }
};

/**
 * Update a warehouse
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const updateWarehouse = async (req, res) => {
  const { warehouseId } = req.params;
  const { name, address, isEnabled } = req.body;
  const warehouseService = WarehouseService.getInstance();
  const loggerService = LoggerService.getInstance();

  try {
    const warehouse = await warehouseService.updateWarehouse(warehouseId, {
      name,
      address,
      isEnabled
    });

    if (!warehouse) {
      return res.status(404).json({ code: 4000 });
    }

    return res.status(200).json({ warehouse });
  } catch (error) {
    loggerService.error("warehouseService@updateWarehouse", {
      requestId: req.requestId,
      userIp: req.userIp,
      body: req.body,
      reason: error?.message ?? "Unknown error",
      type: "logic"
    });
    return res.status(400).json({ code: 4000 });
  }
};

/**
 * Delete a warehouse (soft delete)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const deleteWarehouse = async (req, res) => {
  const { warehouseId } = req.params;
  const warehouseService = WarehouseService.getInstance();
  const loggerService = LoggerService.getInstance();

  try {
    const warehouse = await warehouseService.deleteWarehouse(warehouseId);

    if (!warehouse) {
      return res.status(404).json({ code: 4000 });
    }

    return res.status(200).json({ warehouse });
  } catch (error) {
    loggerService.error("warehouseService@deleteWarehouse", {
      requestId: req.requestId,
      userIp: req.userIp,
      reason: error?.message ?? "Unknown error",
      type: "logic"
    });
    return res.status(500).json({ message: "Internal error" });
  }
};

module.exports = {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
};
