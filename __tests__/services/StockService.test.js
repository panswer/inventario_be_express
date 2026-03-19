const mongoose = require("mongoose");
const StockService = require("../../src/services/StockService");
const Stock = require("../../src/models/Stock");
const Product = require("../../src/models/Product");
require("../../src/models/Price");

describe("StockService", () => {
  beforeEach(() => {
    StockService.destroyInstance();
  });

  afterEach(async () => {
    StockService.destroyInstance();
    await Stock.deleteMany({});
    await Product.deleteMany({});
  });

  describe("getInstance", () => {
    it("should return the same instance (singleton)", () => {
      const instance1 = StockService.getInstance();
      const instance2 = StockService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("createStock", () => {
    it("should create a new stock", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();
      const stockData = {
        productId,
        quantity: 100,
        minQuantity: 10,
        createdBy: userId,
      };

      const service = StockService.getInstance();
      const result = await service.createStock(stockData);

      expect(result).toBeTruthy();
      expect(result.quantity).toBe(100);
      expect(result.minQuantity).toBe(10);
      expect(result._id).toBeDefined();
    });

    it("should create stock with default values", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();
      const stockData = {
        productId,
        createdBy: userId,
      };

      const service = StockService.getInstance();
      const result = await service.createStock(stockData);

      expect(result.quantity).toBe(0);
      expect(result.minQuantity).toBe(0);
    });
  });

  describe("getStockById", () => {
    it("should return stock with price when found", async () => {
      const userId = new mongoose.Types.ObjectId();
      const product = await Product.create({ name: "Test Product", createdBy: userId });

      const stock = await Stock.create({
        productId: product._id,
        quantity: 50,
        minQuantity: 5,
        createdBy: userId,
      });

      const service = StockService.getInstance();
      const result = await service.getStockById(stock._id);

      expect(result).toBeTruthy();
      expect(result.quantity).toBe(50);
      expect(result.productId.name).toBe("Test Product");
    });

    it("should return null when not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const service = StockService.getInstance();
      const result = await service.getStockById(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe("getStockByProductId", () => {
    it("should return stock with price when found", async () => {
      const userId = new mongoose.Types.ObjectId();
      const product = await Product.create({ name: "Test Product", createdBy: userId });

      await Stock.create({
        productId: product._id,
        quantity: 75,
        minQuantity: 15,
        createdBy: userId,
      });

      const service = StockService.getInstance();
      const result = await service.getStockByProductId(product._id);

      expect(result).toBeTruthy();
      expect(result.quantity).toBe(75);
      expect(result.productId.name).toBe("Test Product");
    });

    it("should return null when not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const service = StockService.getInstance();
      const result = await service.getStockByProductId(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe("getStocks", () => {
    it("should return paginated stocks with price", async () => {
      const userId = new mongoose.Types.ObjectId();

      for (let i = 0; i < 5; i++) {
        const product = await Product.create({ name: `Product ${i}`, createdBy: userId });
        await Stock.create({
          productId: product._id,
          quantity: i * 10,
          createdBy: userId,
        });
      }

      const service = StockService.getInstance();
      const result = await service.getStocks(0, 3);

      expect(result.stocks).toHaveLength(3);
      expect(result.total).toBe(5);
      expect(result.stocks[0].productId.name).toBeDefined();
    });
  });

  describe("updateStock", () => {
    it("should update stock minQuantity", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();

      const stock = await Stock.create({
        productId,
        quantity: 100,
        minQuantity: 10,
        createdBy: userId,
      });

      const service = StockService.getInstance();
      const result = await service.updateStock(stock._id, 20);

      expect(result.minQuantity).toBe(20);
      expect(result.quantity).toBe(100);
    });

    it("should return null when stock not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const service = StockService.getInstance();
      const result = await service.updateStock(nonExistentId, 10);

      expect(result).toBeNull();
    });
  });

  describe("addStock", () => {
    it("should increment quantity", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();

      const stock = await Stock.create({
        productId,
        quantity: 100,
        createdBy: userId,
      });

      const service = StockService.getInstance();
      const result = await service.addStock(stock._id, 50);

      expect(result.quantity).toBe(150);
    });

    it("should return null when stock not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const service = StockService.getInstance();
      const result = await service.addStock(nonExistentId, 50);

      expect(result).toBeNull();
    });
  });

  describe("removeStock", () => {
    it("should decrement quantity", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();

      const stock = await Stock.create({
        productId,
        quantity: 100,
        minQuantity: 0,
        createdBy: userId,
      });

      const service = StockService.getInstance();
      const result = await service.removeStock(stock._id, 30);

      expect(result.quantity).toBe(70);
    });

    it("should allow removal to exactly minQuantity", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();

      const stock = await Stock.create({
        productId,
        quantity: 20,
        minQuantity: 10,
        createdBy: userId,
      });

      const service = StockService.getInstance();
      const result = await service.removeStock(stock._id, 10);

      expect(result.quantity).toBe(10);
    });

    it("should return null when removal would go below minQuantity", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();

      const stock = await Stock.create({
        productId,
        quantity: 20,
        minQuantity: 10,
        createdBy: userId,
      });

      const service = StockService.getInstance();
      const result = await service.removeStock(stock._id, 15);

      expect(result).toBeNull();
    });

    it("should return null when stock not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const service = StockService.getInstance();
      const result = await service.removeStock(nonExistentId, 10);

      expect(result).toBeNull();
    });
  });

  describe("destroyInstance", () => {
    it("should allow creating a new instance after destroying", () => {
      const instance1 = StockService.getInstance();
      StockService.destroyInstance();

      const instance2 = StockService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });
});
