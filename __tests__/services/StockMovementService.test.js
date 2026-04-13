const mongoose = require("mongoose");
const StockMovementService = require("../../src/services/StockMovementService");
const StockMovement = require("../../src/models/StockMovement");
const Product = require("../../src/models/Product");
const Warehouse = require("../../src/models/Warehouse");
const User = require("../../src/models/User");
require("../../src/models/Bill");
const { stockMovementEnum } = require("../../src/enums/stockMovementEnum");

describe("StockMovementService", () => {
  let userId;
  let productId;
  let warehouseId;

  beforeEach(async () => {
    StockMovementService.destroyInstance();
    userId = new mongoose.Types.ObjectId();
    
    const user = await User.create({
      username: "testuser",
      email: "test@test.com",
      password: "password123",
    });
    userId = user._id;

    const product = await Product.create({ name: "Test Product", createdBy: userId });
    productId = product._id;

    const warehouse = await Warehouse.create({
      name: "Test Warehouse",
      address: "Test Address",
      createdBy: userId,
    });
    warehouseId = warehouse._id;
  });

  afterEach(async () => {
    StockMovementService.destroyInstance();
    await StockMovement.deleteMany({});
    await Product.deleteMany({});
    await Warehouse.deleteMany({});
    await User.deleteMany({});
  });

  describe("getInstance", () => {
    it("should return the same instance (singleton)", () => {
      const instance1 = StockMovementService.getInstance();
      const instance2 = StockMovementService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("destroyInstance", () => {
    it("should allow creating a new instance after destroying", () => {
      const instance1 = StockMovementService.getInstance();
      StockMovementService.destroyInstance();
      
      const instance2 = StockMovementService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe("createMovement", () => {
    let service;

    beforeEach(() => {
      service = StockMovementService.getInstance();
    });

    it("should create a new stock movement", async () => {
      const movementData = {
        type: stockMovementEnum.initial,
        quantity: 100,
        previousQuantity: 0,
        newQuantity: 100,
        productId,
        warehouseId,
        createdBy: userId,
      };

      const result = await service.createMovement(movementData);

      expect(result).toBeDefined();
      expect(result._id).toBeDefined();
      expect(result.type).toBe(stockMovementEnum.initial);
      expect(result.quantity).toBe(100);
    });

    it("should create movement with reason (adjustment)", async () => {
      const movementData = {
        type: stockMovementEnum.adjust,
        quantity: 5,
        previousQuantity: 100,
        newQuantity: 105,
        productId,
        warehouseId,
        createdBy: userId,
        reason: "Inventory correction",
      };

      const result = await service.createMovement(movementData);

      expect(result.reason).toBe("Inventory correction");
    });

    it("should create movement with bill reference", async () => {
      const movementData = {
        type: stockMovementEnum.in,
        quantity: 50,
        previousQuantity: 0,
        newQuantity: 50,
        productId,
        warehouseId,
        createdBy: userId,
        billId: new mongoose.Types.ObjectId(),
      };

      const result = await service.createMovement(movementData);

      expect(result.billId).toBeDefined();
    });
  });

  describe("logMovement", () => {
    let service;

    beforeEach(() => {
      service = StockMovementService.getInstance();
    });

    it("should log a movement with all parameters", async () => {
      const result = await service.logMovement({
        type: stockMovementEnum.in,
        quantity: 25,
        previousQuantity: 75,
        newQuantity: 100,
        productId: productId.toString(),
        warehouseId: warehouseId.toString(),
        createdBy: userId.toString(),
      });

      expect(result).toBeDefined();
      expect(result.type).toBe(stockMovementEnum.in);
      expect(result.quantity).toBe(25);
      expect(result.previousQuantity).toBe(75);
      expect(result.newQuantity).toBe(100);
    });

    it("should log movement with default optional values", async () => {
      const result = await service.logMovement({
        type: stockMovementEnum.out,
        quantity: 10,
        previousQuantity: 50,
        newQuantity: 40,
        productId: productId.toString(),
        warehouseId: warehouseId.toString(),
        createdBy: userId.toString(),
      });

      expect(result.billId).toBeNull();
      expect(result.reason).toBeNull();
      expect(result.transferToWarehouseId).toBeNull();
      expect(result.transferFromWarehouseId).toBeNull();
    });

    it("should log transfer movement", async () => {
      const toWarehouseId = new mongoose.Types.ObjectId();
      
      const result = await service.logMovement({
        type: stockMovementEnum.transfer,
        quantity: 30,
        previousQuantity: 30,
        newQuantity: 30,
        productId: productId.toString(),
        warehouseId: warehouseId.toString(),
        createdBy: userId.toString(),
        transferToWarehouseId: toWarehouseId.toString(),
        transferFromWarehouseId: warehouseId.toString(),
      });

      expect(result.transferToWarehouseId.toString()).toBe(toWarehouseId.toString());
      expect(result.transferFromWarehouseId.toString()).toBe(warehouseId.toString());
    });

    it("should log movement with bill reference", async () => {
      const billId = new mongoose.Types.ObjectId();
      
      const result = await service.logMovement({
        type: stockMovementEnum.in,
        quantity: 100,
        previousQuantity: 0,
        newQuantity: 100,
        productId: productId.toString(),
        warehouseId: warehouseId.toString(),
        createdBy: userId.toString(),
        billId: billId.toString(),
      });

      expect(result.billId.toString()).toBe(billId.toString());
    });
  });

  describe("getMovements", () => {
    let service;

    beforeEach(() => {
      service = StockMovementService.getInstance();
    });

    it("should return movements with pagination", async () => {
      await StockMovement.create([
        { type: stockMovementEnum.in, quantity: 10, previousQuantity: 0, newQuantity: 10, productId, warehouseId, createdBy: userId },
        { type: stockMovementEnum.in, quantity: 20, previousQuantity: 10, newQuantity: 30, productId, warehouseId, createdBy: userId },
        { type: stockMovementEnum.out, quantity: 5, previousQuantity: 30, newQuantity: 25, productId, warehouseId, createdBy: userId },
      ]);

      const result = await service.getMovements(0, 10);

      expect(result).toHaveProperty("movements");
      expect(result).toHaveProperty("total");
      expect(result.movements.length).toBe(3);
      expect(result.total).toBe(3);
    });

    it("should respect pagination (skip and limit)", async () => {
      for (let i = 0; i < 5; i++) {
        await StockMovement.create({
          type: stockMovementEnum.in,
          quantity: i + 1,
          previousQuantity: i,
          newQuantity: i + 1,
          productId,
          warehouseId,
          createdBy: userId,
        });
      }

      const result = await service.getMovements(2, 2);

      expect(result.movements.length).toBe(2);
      expect(result.total).toBe(5);
    });

    it("should filter by productId", async () => {
      const product2Id = (await Product.create({ name: "Product 2", createdBy: userId }))._id;
      
      await StockMovement.create([
        { type: stockMovementEnum.in, quantity: 10, previousQuantity: 0, newQuantity: 10, productId, warehouseId, createdBy: userId },
        { type: stockMovementEnum.in, quantity: 20, previousQuantity: 0, newQuantity: 20, productId: product2Id, warehouseId, createdBy: userId },
      ]);

      const result = await service.getMovements(0, 10, { productId: productId.toString() });

      expect(result.movements.length).toBe(1);
      expect(result.total).toBe(1);
    });

    it("should filter by warehouseId", async () => {
      const warehouse2Id = (await Warehouse.create({ name: "Warehouse 2", address: "Address 2", createdBy: userId }))._id;
      
      await StockMovement.create([
        { type: stockMovementEnum.in, quantity: 10, previousQuantity: 0, newQuantity: 10, productId, warehouseId, createdBy: userId },
        { type: stockMovementEnum.in, quantity: 20, previousQuantity: 0, newQuantity: 20, productId, warehouseId: warehouse2Id, createdBy: userId },
      ]);

      const result = await service.getMovements(0, 10, { warehouseId: warehouseId.toString() });

      expect(result.movements.length).toBe(1);
      expect(result.total).toBe(1);
    });

    it("should filter by type", async () => {
      await StockMovement.create([
        { type: stockMovementEnum.in, quantity: 10, previousQuantity: 0, newQuantity: 10, productId, warehouseId, createdBy: userId },
        { type: stockMovementEnum.out, quantity: 5, previousQuantity: 10, newQuantity: 5, productId, warehouseId, createdBy: userId },
      ]);

      const result = await service.getMovements(0, 10, { type: stockMovementEnum.in });

      expect(result.movements.length).toBe(1);
      expect(result.movements[0].type).toBe(stockMovementEnum.in);
    });

    it("should filter by date range", async () => {
      const pastDate = new Date("2024-01-01");
      const futureDate = new Date("2025-01-01");
      
      await StockMovement.create({
        type: stockMovementEnum.in,
        quantity: 10,
        previousQuantity: 0,
        newQuantity: 10,
        productId,
        warehouseId,
        createdBy: userId,
        createdAt: new Date("2024-06-15"),
      });

      const result = await service.getMovements(0, 10, {
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });

      expect(result.total).toBe(1);
    });

    it("should return total count of 0 when no movements", async () => {
      const result = await service.getMovements(0, 10);

      expect(result.movements).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("should combine multiple filters", async () => {
      await StockMovement.create([
        { type: stockMovementEnum.in, quantity: 10, previousQuantity: 0, newQuantity: 10, productId, warehouseId, createdBy: userId },
        { type: stockMovementEnum.out, quantity: 5, previousQuantity: 10, newQuantity: 5, productId, warehouseId, createdBy: userId },
      ]);

      const result = await service.getMovements(0, 10, {
        productId: productId.toString(),
        warehouseId: warehouseId.toString(),
        type: stockMovementEnum.in,
      });

      expect(result.movements.length).toBe(1);
      expect(result.movements[0].type).toBe(stockMovementEnum.in);
    });
  });

  describe("getMovementsByProductId", () => {
    let service;

    beforeEach(() => {
      service = StockMovementService.getInstance();
    });

    it("should return movements for a specific product", async () => {
      const product2Id = (await Product.create({ name: "Product 2", createdBy: userId }))._id;
      
      await StockMovement.create([
        { type: stockMovementEnum.in, quantity: 10, previousQuantity: 0, newQuantity: 10, productId, warehouseId, createdBy: userId },
        { type: stockMovementEnum.in, quantity: 20, previousQuantity: 0, newQuantity: 20, productId: product2Id, warehouseId, createdBy: userId },
      ]);

      const result = await service.getMovementsByProductId(productId.toString());

      expect(result.length).toBe(1);
      expect(result[0].productId._id.toString()).toBe(productId.toString());
    });

    it("should limit results by default (50)", async () => {
      for (let i = 0; i < 60; i++) {
        await StockMovement.create({
          type: stockMovementEnum.in,
          quantity: 1,
          previousQuantity: 0,
          newQuantity: 1,
          productId,
          warehouseId,
          createdBy: userId,
        });
      }

      const result = await service.getMovementsByProductId(productId.toString());

      expect(result.length).toBe(50);
    });

    it("should respect custom limit", async () => {
      for (let i = 0; i < 10; i++) {
        await StockMovement.create({
          type: stockMovementEnum.in,
          quantity: 1,
          previousQuantity: 0,
          newQuantity: 1,
          productId,
          warehouseId,
          createdBy: userId,
        });
      }

      const result = await service.getMovementsByProductId(productId.toString(), 5);

      expect(result.length).toBe(5);
    });

    it("should return empty array when no movements", async () => {
      const result = await service.getMovementsByProductId(productId.toString());

      expect(result).toEqual([]);
    });

    it("should sort by createdAt descending", async () => {
      await StockMovement.create([
        { type: stockMovementEnum.in, quantity: 1, previousQuantity: 0, newQuantity: 1, productId, warehouseId, createdBy: userId, createdAt: new Date("2024-01-01") },
        { type: stockMovementEnum.in, quantity: 2, previousQuantity: 0, newQuantity: 2, productId, warehouseId, createdBy: userId, createdAt: new Date("2024-01-03") },
        { type: stockMovementEnum.in, quantity: 3, previousQuantity: 0, newQuantity: 3, productId, warehouseId, createdBy: userId, createdAt: new Date("2024-01-02") },
      ]);

      const result = await service.getMovementsByProductId(productId.toString());

      expect(result[0].quantity).toBe(2);
      expect(result[1].quantity).toBe(3);
      expect(result[2].quantity).toBe(1);
    });
  });

  describe("getMovementsByProductAndWarehouse", () => {
    let service;

    beforeEach(() => {
      service = StockMovementService.getInstance();
    });

    it("should return movements for product in specific warehouse", async () => {
      const warehouse2Id = (await Warehouse.create({ name: "Warehouse 2", address: "Address 2", createdBy: userId }))._id;
      
      await StockMovement.create([
        { type: stockMovementEnum.in, quantity: 10, previousQuantity: 0, newQuantity: 10, productId, warehouseId, createdBy: userId },
        { type: stockMovementEnum.in, quantity: 20, previousQuantity: 0, newQuantity: 20, productId, warehouseId: warehouse2Id, createdBy: userId },
      ]);

      const result = await service.getMovementsByProductAndWarehouse(
        productId.toString(),
        warehouseId.toString()
      );

      expect(result.length).toBe(1);
      expect(result[0].warehouseId._id.toString()).toBe(warehouseId.toString());
    });

    it("should respect custom limit", async () => {
      for (let i = 0; i < 10; i++) {
        await StockMovement.create({
          type: stockMovementEnum.in,
          quantity: i + 1,
          previousQuantity: 0,
          newQuantity: i + 1,
          productId,
          warehouseId,
          createdBy: userId,
        });
      }

      const result = await service.getMovementsByProductAndWarehouse(
        productId.toString(),
        warehouseId.toString(),
        3
      );

      expect(result.length).toBe(3);
    });

    it("should return empty array when no matches", async () => {
      const result = await service.getMovementsByProductAndWarehouse(
        productId.toString(),
        warehouseId.toString()
      );

      expect(result).toEqual([]);
    });

    it("should sort by createdAt descending", async () => {
      await StockMovement.create([
        { type: stockMovementEnum.in, quantity: 1, previousQuantity: 0, newQuantity: 1, productId, warehouseId, createdBy: userId, createdAt: new Date("2024-01-01") },
        { type: stockMovementEnum.in, quantity: 2, previousQuantity: 0, newQuantity: 2, productId, warehouseId, createdBy: userId, createdAt: new Date("2024-01-03") },
      ]);

      const result = await service.getMovementsByProductAndWarehouse(
        productId.toString(),
        warehouseId.toString()
      );

      expect(result[0].quantity).toBe(2);
    });
  });
});