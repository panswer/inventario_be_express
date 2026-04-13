const mongoose = require("mongoose");
const ReportService = require("../../src/services/ReportService");
const StockMovement = require("../../src/models/StockMovement");
const Product = require("../../src/models/Product");
const Warehouse = require("../../src/models/Warehouse");
const User = require("../../src/models/User");
const { stockMovementEnum } = require("../../src/enums/stockMovementEnum");

describe("ReportService", () => {
  let userId;
  let productId;
  let warehouseId;

  beforeEach(async () => {
    ReportService.destroyInstance();
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
    ReportService.destroyInstance();
    await StockMovement.deleteMany({});
    await Product.deleteMany({});
    await Warehouse.deleteMany({});
    await User.deleteMany({});
  });

  describe("getInstance", () => {
    it("should return the same instance (singleton)", () => {
      const instance1 = ReportService.getInstance();
      const instance2 = ReportService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("destroyInstance", () => {
    it("should allow creating a new instance after destroying", () => {
      const instance1 = ReportService.getInstance();
      ReportService.destroyInstance();
      
      const instance2 = ReportService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe("buildMatchStage", () => {
    let service;

    beforeEach(() => {
      service = ReportService.getInstance();
    });

    it("should return empty object when no filters", () => {
      const result = service.buildMatchStage({});
      expect(result).toEqual({});
    });

    it("should add productId to match stage", () => {
      const result = service.buildMatchStage({ productId: "123" });
      expect(result).toHaveProperty("productId", "123");
    });

    it("should add warehouseId to match stage", () => {
      const result = service.buildMatchStage({ warehouseId: "456" });
      expect(result).toHaveProperty("warehouseId", "456");
    });

    it("should add type to match stage", () => {
      const result = service.buildMatchStage({ type: stockMovementEnum.in });
      expect(result).toHaveProperty("type", stockMovementEnum.in);
    });

    it("should add date range to match stage", () => {
      const startDate = "2024-01-01";
      const endDate = "2024-12-31";
      const result = service.buildMatchStage({ startDate, endDate });
      
      expect(result).toHaveProperty("createdAt");
      expect(result.createdAt.$gte).toEqual(new Date(startDate));
      expect(result.createdAt.$lte).toEqual(new Date(endDate));
    });

    it("should add only startDate", () => {
      const startDate = "2024-01-01";
      const result = service.buildMatchStage({ startDate });
      
      expect(result.createdAt).toHaveProperty("$gte");
      expect(result.createdAt.$gte).toEqual(new Date(startDate));
      expect(result.createdAt).not.toHaveProperty("$lte");
    });

    it("should add only endDate", () => {
      const endDate = "2024-12-31";
      const result = service.buildMatchStage({ endDate });
      
      expect(result.createdAt).toHaveProperty("$lte");
      expect(result.createdAt.$lte).toEqual(new Date(endDate));
      expect(result.createdAt).not.toHaveProperty("$gte");
    });

    it("should combine multiple filters", () => {
      const result = service.buildMatchStage({
        productId: "123",
        warehouseId: "456",
        type: stockMovementEnum.in,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });
      
      expect(result).toHaveProperty("productId", "123");
      expect(result).toHaveProperty("warehouseId", "456");
      expect(result).toHaveProperty("type", stockMovementEnum.in);
      expect(result).toHaveProperty("createdAt");
    });
  });

  describe("getMovementsAggregation", () => {
    let service;

    beforeEach(() => {
      service = ReportService.getInstance();
    });

    it("should return aggregation pipeline array", () => {
      const result = service.getMovementsAggregation({});
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should start with $match stage", () => {
      const result = service.getMovementsAggregation({});
      expect(result[0]).toHaveProperty("$match");
    });

    it("should include lookups for product, warehouse, user", () => {
      const result = service.getMovementsAggregation({});
      const lookupStages = result.filter(stage => stage.$lookup);
      expect(lookupStages.length).toBeGreaterThanOrEqual(4);
    });

    it("should apply filters in $match stage", () => {
      const result = service.getMovementsAggregation({ productId: "123" });
      expect(result[0].$match).toHaveProperty("productId", "123");
    });
  });

  describe("createWorkbook", () => {
    let service;

    beforeEach(() => {
      service = ReportService.getInstance();
    });

    it("should create a workbook with worksheet", () => {
      const { workbook, worksheet } = service.createWorkbook("Test Sheet", ["Column1", "Column2"]);
      
      expect(workbook).toBeDefined();
      expect(worksheet).toBeDefined();
    });

    it("should add header row with columns", () => {
      const columns = ["Fecha", "Tipo", "Cantidad"];
      const { worksheet } = service.createWorkbook("Test", columns);
      
      const row1 = worksheet.getRow(1);
      expect(row1.values.slice(1)).toEqual(columns);
    });

    it("should format header row as bold", () => {
      const columns = ["Column1"];
      const { worksheet } = service.createWorkbook("Test", columns);
      
      const row1 = worksheet.getRow(1);
      expect(row1.font.bold).toBe(true);
    });

    it("should add gray fill to header row", () => {
      const columns = ["Column1"];
      const { worksheet } = service.createWorkbook("Test", columns);
      
      const row1 = worksheet.getRow(1);
      expect(row1.fill).toBeDefined();
    });
  });

  describe("generateMovementsReport", () => {
    let service;

    beforeEach(() => {
      service = ReportService.getInstance();
    });

    it("should return a PassThrough stream", async () => {
      const result = await service.generateMovementsReport({});
      
      expect(result).toBeDefined();
      expect(typeof result.pipe).toBe("function");
    });

    it("should generate report with movements", async () => {
      await StockMovement.create({
        type: stockMovementEnum.in,
        quantity: 10,
        previousQuantity: 0,
        newQuantity: 10,
        productId,
        warehouseId,
        createdBy: userId,
      });

      const result = await service.generateMovementsReport({});
      expect(result).toBeDefined();
    });

    it("should filter by productId", async () => {
      await StockMovement.create({
        type: stockMovementEnum.in,
        quantity: 10,
        previousQuantity: 0,
        newQuantity: 10,
        productId,
        warehouseId,
        createdBy: userId,
      });

      const result = await service.generateMovementsReport({ productId: productId.toString() });
      expect(result).toBeDefined();
    });

    it("should filter by warehouseId", async () => {
      await StockMovement.create({
        type: stockMovementEnum.out,
        quantity: 5,
        previousQuantity: 10,
        newQuantity: 5,
        productId,
        warehouseId,
        createdBy: userId,
      });

      const result = await service.generateMovementsReport({ warehouseId: warehouseId.toString() });
      expect(result).toBeDefined();
    });

    it("should filter by movement type", async () => {
      await StockMovement.create({
        type: stockMovementEnum.adjust,
        quantity: 2,
        previousQuantity: 5,
        newQuantity: 7,
        productId,
        warehouseId,
        createdBy: userId,
        reason: "Inventory correction",
      });

      const result = await service.generateMovementsReport({ type: stockMovementEnum.adjust });
      expect(result).toBeDefined();
    });

    it("should filter by date range", async () => {
      await StockMovement.create({
        type: stockMovementEnum.initial,
        quantity: 100,
        previousQuantity: 0,
        newQuantity: 100,
        productId,
        warehouseId,
        createdBy: userId,
      });

      const result = await service.generateMovementsReport({
        startDate: "2020-01-01",
        endDate: "2030-12-31",
      });
      expect(result).toBeDefined();
    });
  });

  describe("generateSummaryReport", () => {
    let service;

    beforeEach(() => {
      service = ReportService.getInstance();
    });

    it("should return a buffer", async () => {
      const result = await service.generateSummaryReport({});
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it("should calculate totals for movements", async () => {
      await StockMovement.create([
        {
          type: stockMovementEnum.in,
          quantity: 50,
          previousQuantity: 0,
          newQuantity: 50,
          productId,
          warehouseId,
          createdBy: userId,
        },
        {
          type: stockMovementEnum.out,
          quantity: 20,
          previousQuantity: 50,
          newQuantity: 30,
          productId,
          warehouseId,
          createdBy: userId,
        },
      ]);

      const result = await service.generateSummaryReport({});
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should group by product and warehouse", async () => {
      await StockMovement.create({
        type: stockMovementEnum.in,
        quantity: 100,
        previousQuantity: 0,
        newQuantity: 100,
        productId,
        warehouseId,
        createdBy: userId,
      });

      const result = await service.generateSummaryReport({});
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });

  describe("generateTransfersReport", () => {
    let service;
    let destWarehouseId;

    beforeEach(async () => {
      service = ReportService.getInstance();
      const destWarehouse = await Warehouse.create({
        name: "Destination Warehouse",
        address: "Dest Address",
        createdBy: userId,
      });
      destWarehouseId = destWarehouse._id;
    });

    it("should return a buffer", async () => {
      const result = await service.generateTransfersReport({});
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it("should include transfer movements", async () => {
      await StockMovement.create({
        type: stockMovementEnum.transfer,
        quantity: 15,
        previousQuantity: 15,
        newQuantity: 15,
        productId,
        warehouseId,
        transferToWarehouseId: destWarehouseId,
        transferFromWarehouseId: warehouseId,
        createdBy: userId,
      });

      const result = await service.generateTransfersReport({});
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it("should filter transfers by warehouse", async () => {
      await StockMovement.create({
        type: stockMovementEnum.transfer,
        quantity: 10,
        previousQuantity: 10,
        newQuantity: 10,
        productId,
        warehouseId,
        transferToWarehouseId: destWarehouseId,
        transferFromWarehouseId: warehouseId,
        createdBy: userId,
      });

      const result = await service.generateTransfersReport({
        warehouseId: warehouseId.toString(),
      });
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });
});