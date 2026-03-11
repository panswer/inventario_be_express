const mongoose = require("mongoose");
const PriceService = require("../../src/services/PriceService");
const Price = require("../../src/models/Price");

describe("PriceService", () => {
  beforeEach(() => {
    PriceService.destroyInstance();
  });

  afterEach(() => {
    PriceService.destroyInstance();
  });

  describe("getInstance", () => {
    it("should return the same instance (singleton)", () => {
      const instance1 = PriceService.getInstance();
      const instance2 = PriceService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("getPriceByProductId", () => {
    it("should return price when found", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();
      
      const price = await Price.create({
        amount: 100,
        coin: "$",
        productId,
        createdBy: userId,
      });

      const service = PriceService.getInstance();
      const result = await service.getPriceByProductId(productId);

      expect(result).toBeTruthy();
      expect(result.amount).toBe(100);
    });

    it("should return null when not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const service = PriceService.getInstance();
      const result = await service.getPriceByProductId(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe("getPriceByIdAndCoin", () => {
    it("should return price when found", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();
      
      const price = await Price.create({
        amount: 100,
        coin: "$",
        productId,
        createdBy: userId,
      });

      const service = PriceService.getInstance();
      const result = await service.getPriceByIdAndCoin(price._id, "$");

      expect(result).toBeTruthy();
      expect(result.coin).toBe("$");
    });

    it("should return null when coin does not match", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();
      
      const price = await Price.create({
        amount: 100,
        coin: "$",
        productId,
        createdBy: userId,
      });

      const service = PriceService.getInstance();
      const result = await service.getPriceByIdAndCoin(price._id, "Brs.");

      expect(result).toBeNull();
    });
  });

  describe("createPrice", () => {
    it("should create a new price", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();
      const priceData = {
        amount: 100,
        coin: "$",
        productId,
        createdBy: userId,
      };

      const service = PriceService.getInstance();
      const result = await service.createPrice(priceData);

      expect(result).toBeTruthy();
      expect(result.amount).toBe(100);
      expect(result._id).toBeDefined();
    });
  });

  describe("destroyInstance", () => {
    it("should allow creating a new instance after destroying", () => {
      const instance1 = PriceService.getInstance();
      PriceService.destroyInstance();
      
      const instance2 = PriceService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });
});
