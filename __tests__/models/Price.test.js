const mongoose = require("mongoose");
const Price = require("../../src/models/Price");

describe("Price Model", () => {
  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe("Schema Validation", () => {
    it("should throw error when amount is missing", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();
      const price = new Price({
        coin: "$",
        productId,
        createdBy: userId,
      });

      await expect(price.save()).rejects.toThrow("amount is required");
    });

    it("should throw error when coin is missing", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();
      const price = new Price({
        amount: 100,
        productId,
        createdBy: userId,
      });

      await expect(price.save()).rejects.toThrow("coin is required");
    });

    it("should throw error when productId is missing", async () => {
      const userId = new mongoose.Types.ObjectId();
      const price = new Price({
        amount: 100,
        coin: "$",
        createdBy: userId,
      });

      await expect(price.save()).rejects.toThrow("productId is required");
    });

    it("should throw error when createdBy is missing", async () => {
      const productId = new mongoose.Types.ObjectId();
      const price = new Price({
        amount: 100,
        coin: "$",
        productId,
      });

      await expect(price.save()).rejects.toThrow("createdBy is required");
    });

    it("should throw error for invalid coin enum", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();
      const price = new Price({
        amount: 100,
        coin: "INVALID",
        productId,
        createdBy: userId,
      });

      await expect(price.save()).rejects.toThrow();
    });

    it("should create price with valid coin '$'", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();
      const price = new Price({
        amount: 100,
        coin: "$",
        productId,
        createdBy: userId,
      });

      const savedPrice = await price.save();

      expect(savedPrice.amount).toBe(100);
      expect(savedPrice.coin).toBe("$");
    });

    it("should create price with valid coin 'Brs.'", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();
      const price = new Price({
        amount: 100,
        coin: "Brs.",
        productId,
        createdBy: userId,
      });

      const savedPrice = await price.save();

      expect(savedPrice.amount).toBe(100);
      expect(savedPrice.coin).toBe("Brs.");
    });
  });

  describe("toJSON Transform", () => {
    it("should convert createdAt to timestamp in toJSON", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();
      const price = new Price({
        amount: 100,
        coin: "$",
        productId,
        createdBy: userId,
      });
      await price.save();

      const json = price.toJSON();

      expect(json.createdAt).toBeDefined();
      expect(typeof json.createdAt).toBe("number");
    });

    it("should convert updatedAt to timestamp in toJSON", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();
      const price = new Price({
        amount: 100,
        coin: "$",
        productId,
        createdBy: userId,
      });
      await price.save();

      const json = price.toJSON();

      expect(json.updatedAt).toBeDefined();
      expect(typeof json.updatedAt).toBe("number");
    });
  });
});
