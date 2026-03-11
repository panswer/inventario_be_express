const mongoose = require("mongoose");
const Product = require("../../src/models/Product");

describe("Product Model", () => {
  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe("Schema Validation", () => {
    it("should throw error when name is missing", async () => {
      const userId = new mongoose.Types.ObjectId();
      const product = new Product({ createdBy: userId });

      await expect(product.save()).rejects.toThrow("name is required");
    });

    it("should throw error when createdBy is missing", async () => {
      const product = new Product({ name: "Test Product" });

      await expect(product.save()).rejects.toThrow("createdBy is required");
    });

    it("should create product with valid data", async () => {
      const userId = new mongoose.Types.ObjectId();
      const product = new Product({
        name: "Test Product",
        createdBy: userId,
      });

      const savedProduct = await product.save();

      expect(savedProduct.name).toBe("Test Product");
      expect(savedProduct.createdBy).toEqual(userId);
      expect(savedProduct._id).toBeDefined();
    });
  });

  describe("Default Values", () => {
    it("should default inStock to true", async () => {
      const userId = new mongoose.Types.ObjectId();
      const product = new Product({
        name: "Test Product",
        createdBy: userId,
      });

      const savedProduct = await product.save();

      expect(savedProduct.inStock).toBe(true);
    });

    it("should allow inStock to be set to false", async () => {
      const userId = new mongoose.Types.ObjectId();
      const product = new Product({
        name: "Test Product",
        createdBy: userId,
        inStock: false,
      });

      const savedProduct = await product.save();

      expect(savedProduct.inStock).toBe(false);
    });
  });

  describe("toJSON Transform", () => {
    it("should convert createdAt to timestamp in toJSON", async () => {
      const userId = new mongoose.Types.ObjectId();
      const product = new Product({
        name: "Test Product",
        createdBy: userId,
      });
      await product.save();

      const json = product.toJSON();

      expect(json.createdAt).toBeDefined();
      expect(typeof json.createdAt).toBe("number");
    });

    it("should convert updatedAt to timestamp in toJSON", async () => {
      const userId = new mongoose.Types.ObjectId();
      const product = new Product({
        name: "Test Product",
        createdBy: userId,
      });
      await product.save();

      const json = product.toJSON();

      expect(json.updatedAt).toBeDefined();
      expect(typeof json.updatedAt).toBe("number");
    });
  });

  describe("Timestamps", () => {
    it("should have createdAt and updatedAt fields", async () => {
      const userId = new mongoose.Types.ObjectId();
      const product = await Product.create({
        name: "Test Product",
        createdBy: userId,
      });

      expect(product.createdAt).toBeDefined();
      expect(product.updatedAt).toBeDefined();
    });
  });
});
