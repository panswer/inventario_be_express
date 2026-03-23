const mongoose = require("mongoose");
const SaleService = require("../../src/services/SaleService");
const Sale = require("../../src/models/Sale");

describe("SaleService", () => {
  beforeEach(() => {
    SaleService.destroyInstance();
  });

  afterEach(() => {
    SaleService.destroyInstance();
  });

  describe("getInstance", () => {
    it("should return the same instance (singleton)", () => {
      const instance1 = SaleService.getInstance();
      const instance2 = SaleService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("createSale", () => {
    it("should create a new sale", async () => {
      const billId = new mongoose.Types.ObjectId();
      const stockId = new mongoose.Types.ObjectId();
      const saleData = {
        billId,
        stockId,
        count: 2,
        price: 50,
        coin: "$",
      };

      const service = SaleService.getInstance();
      const result = await service.createSale(saleData);

      expect(result).toBeTruthy();
      expect(result.count).toBe(2);
      expect(result._id).toBeDefined();
    });
  });

  describe("getSalesByBillId", () => {
    it("should return sales when found", async () => {
      const billId = new mongoose.Types.ObjectId();
      const stockId = new mongoose.Types.ObjectId();
      
      await Sale.create({
        billId,
        stockId,
        count: 2,
        price: 50,
        coin: "$",
      });

      const service = SaleService.getInstance();
      const result = await service.getSalesByBillId(billId);

      expect(result).toHaveLength(1);
      expect(result[0].count).toBe(2);
    });

    it("should return empty array when no sales", async () => {
      const nonExistentBillId = new mongoose.Types.ObjectId();

      const service = SaleService.getInstance();
      const result = await service.getSalesByBillId(nonExistentBillId);

      expect(result).toHaveLength(0);
    });
  });

  describe("destroyInstance", () => {
    it("should allow creating a new instance after destroying", () => {
      const instance1 = SaleService.getInstance();
      SaleService.destroyInstance();
      
      const instance2 = SaleService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });
});
