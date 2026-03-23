const mongoose = require("mongoose");
const Sale = require("../../src/models/Sale");

describe("Sale Model", () => {
  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe("Schema Validation", () => {
    it("should throw error when count is missing", async () => {
      const stockId = new mongoose.Types.ObjectId();
      const billId = new mongoose.Types.ObjectId();
      const sale = new Sale({
        stockId,
        price: 50,
        billId,
        coin: "$",
      });

      await expect(sale.save()).rejects.toThrow("It's required how many items");
    });

    it("should throw error when stockId is missing", async () => {
      const billId = new mongoose.Types.ObjectId();
      const sale = new Sale({
        count: 2,
        price: 50,
        billId,
        coin: "$",
      });

      await expect(sale.save()).rejects.toThrow("stockId is required");
    });

    it("should throw error when price is missing", async () => {
      const stockId = new mongoose.Types.ObjectId();
      const billId = new mongoose.Types.ObjectId();
      const sale = new Sale({
        count: 2,
        stockId,
        billId,
        coin: "$",
      });

      await expect(sale.save()).rejects.toThrow("The price is required");
    });

    it("should throw error when billId is missing", async () => {
      const stockId = new mongoose.Types.ObjectId();
      const sale = new Sale({
        count: 2,
        stockId,
        price: 50,
        coin: "$",
      });

      await expect(sale.save()).rejects.toThrow("bill's id is required");
    });

    it("should throw error when coin is missing", async () => {
      const stockId = new mongoose.Types.ObjectId();
      const billId = new mongoose.Types.ObjectId();
      const sale = new Sale({
        count: 2,
        stockId,
        price: 50,
        billId,
      });

      await expect(sale.save()).rejects.toThrow("coin is required");
    });

    it("should throw error for invalid coin enum", async () => {
      const stockId = new mongoose.Types.ObjectId();
      const billId = new mongoose.Types.ObjectId();
      const sale = new Sale({
        count: 2,
        stockId,
        price: 50,
        billId,
        coin: "INVALID",
      });

      await expect(sale.save()).rejects.toThrow();
    });

    it("should create sale with valid coin '$'", async () => {
      const stockId = new mongoose.Types.ObjectId();
      const billId = new mongoose.Types.ObjectId();
      const sale = new Sale({
        count: 2,
        stockId,
        price: 50,
        billId,
        coin: "$",
      });

      const savedSale = await sale.save();

      expect(savedSale.count).toBe(2);
      expect(savedSale.coin).toBe("$");
    });

    it("should create sale with valid coin 'Brs.'", async () => {
      const stockId = new mongoose.Types.ObjectId();
      const billId = new mongoose.Types.ObjectId();
      const sale = new Sale({
        count: 2,
        stockId,
        price: 50,
        billId,
        coin: "Brs.",
      });

      const savedSale = await sale.save();

      expect(savedSale.count).toBe(2);
      expect(savedSale.coin).toBe("Brs.");
    });

    it("should throw error when count is less than 1", async () => {
      const stockId = new mongoose.Types.ObjectId();
      const billId = new mongoose.Types.ObjectId();
      const sale = new Sale({
        count: 0,
        stockId,
        price: 50,
        billId,
        coin: "$",
      });

      await expect(sale.save()).rejects.toThrow();
    });
  });

  describe("Timestamps", () => {
    it("should have createdAt and updatedAt fields", async () => {
      const stockId = new mongoose.Types.ObjectId();
      const billId = new mongoose.Types.ObjectId();
      const sale = await Sale.create({
        count: 2,
        stockId,
        price: 50,
        billId,
        coin: "$",
      });

      expect(sale.createdAt).toBeDefined();
      expect(sale.updatedAt).toBeDefined();
    });
  });
});
