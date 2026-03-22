const mongoose = require("mongoose");
const TransferService = require("../../src/services/TransferService");
const WarehouseService = require("../../src/services/WarehouseService");
const Stock = require("../../src/models/Stock");
const Product = require("../../src/models/Product");
const Warehouse = require("../../src/models/Warehouse");
require("../../src/models/Category");

describe("TransferService", () => {
  let transferService;
  let warehouseService;
  let userId;
  let productId;
  let warehouse1Id;
  let warehouse2Id;

  beforeEach(() => {
    TransferService.destroyInstance();
    WarehouseService.destroyInstance();
    transferService = TransferService.getInstance();
    warehouseService = WarehouseService.getInstance();
    userId = new mongoose.Types.ObjectId();
  });

  afterEach(async () => {
    await Stock.deleteMany({});
    await Product.deleteMany({});
    await Warehouse.deleteMany({});
    TransferService.destroyInstance();
    WarehouseService.destroyInstance();
  });

  const setupTestData = async () => {
    const product = await Product.create({ name: "Test Product", createdBy: userId });
    productId = product._id;

    const warehouse1 = await Warehouse.create({ 
      name: "Warehouse 1", 
      address: "Address 1", 
      createdBy: userId 
    });
    warehouse1Id = warehouse1._id;

    const warehouse2 = await Warehouse.create({ 
      name: "Warehouse 2", 
      address: "Address 2", 
      createdBy: userId 
    });
    warehouse2Id = warehouse2._id;

    await Stock.create({ 
      productId, 
      warehouseId: warehouse1Id, 
      quantity: 100, 
      createdBy: userId 
    });

    return { productId, warehouse1Id, warehouse2Id };
  };

  describe("transferStock", () => {
    it("should transfer stock between warehouses", async () => {
      const { productId, warehouse1Id, warehouse2Id } = await setupTestData();

      const result = await transferService.transferStock(
        productId,
        warehouse1Id,
        warehouse2Id,
        50,
        userId
      );

      expect(result.fromStock.quantity).toBe(50);
      expect(result.toStock.quantity).toBe(50);
    });

    it("should throw error if product not found", async () => {
      const { warehouse1Id, warehouse2Id } = await setupTestData();
      const nonExistentProduct = new mongoose.Types.ObjectId();

      await expect(
        transferService.transferStock(
          nonExistentProduct,
          warehouse1Id,
          warehouse2Id,
          10,
          userId
        )
      ).rejects.toThrow("Product not found");
    });

    it("should throw error if source warehouse not found", async () => {
      const { productId, warehouse2Id } = await setupTestData();
      const nonExistentWarehouse = new mongoose.Types.ObjectId();

      await expect(
        transferService.transferStock(
          productId,
          nonExistentWarehouse,
          warehouse2Id,
          10,
          userId
        )
      ).rejects.toThrow("Source warehouse not found");
    });

    it("should throw error if destination warehouse not found", async () => {
      const { productId, warehouse1Id } = await setupTestData();
      const nonExistentWarehouse = new mongoose.Types.ObjectId();

      await expect(
        transferService.transferStock(
          productId,
          warehouse1Id,
          nonExistentWarehouse,
          10,
          userId
        )
      ).rejects.toThrow("Destination warehouse not found");
    });

    it("should throw error if source and destination are the same", async () => {
      const { productId, warehouse1Id } = await setupTestData();

      await expect(
        transferService.transferStock(
          productId,
          warehouse1Id,
          warehouse1Id,
          10,
          userId
        )
      ).rejects.toThrow("Source and destination warehouses must be different");
    });

    it("should throw error if quantity is not positive", async () => {
      const { productId, warehouse1Id, warehouse2Id } = await setupTestData();

      await expect(
        transferService.transferStock(
          productId,
          warehouse1Id,
          warehouse2Id,
          0,
          userId
        )
      ).rejects.toThrow("Quantity must be greater than 0");
    });

    it("should throw error if insufficient stock", async () => {
      const { productId, warehouse1Id, warehouse2Id } = await setupTestData();

      await expect(
        transferService.transferStock(
          productId,
          warehouse1Id,
          warehouse2Id,
          200,
          userId
        )
      ).rejects.toThrow("Insufficient stock in source warehouse");
    });

    it("should create destination stock if not exists", async () => {
      const { productId, warehouse1Id, warehouse2Id } = await setupTestData();

      const result = await transferService.transferStock(
        productId,
        warehouse1Id,
        warehouse2Id,
        50,
        userId
      );

      expect(result.toStock._id).toBeDefined();
      expect(result.toStock.quantity).toBe(50);
    });
  });

  describe("getProductStockByWarehouse", () => {
    it("should return all stocks for a product", async () => {
      const { productId, warehouse1Id, warehouse2Id } = await setupTestData();

      await Stock.create({ 
        productId, 
        warehouseId: warehouse2Id, 
        quantity: 50, 
        createdBy: userId 
      });

      const result = await transferService.getProductStockByWarehouse(productId);

      expect(result).toHaveLength(2);
    });

    it("should exclude stocks from disabled warehouses", async () => {
      const { productId, warehouse1Id, warehouse2Id } = await setupTestData();

      await Warehouse.findByIdAndUpdate(warehouse1Id, { isEnabled: false });
      await Stock.create({ 
        productId, 
        warehouseId: warehouse2Id, 
        quantity: 50, 
        createdBy: userId 
      });

      const result = await transferService.getProductStockByWarehouse(productId);

      expect(result).toHaveLength(1);
      expect(result[0].warehouseId._id.toString()).toBe(warehouse2Id.toString());
    });
  });
});
