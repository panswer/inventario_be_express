const mongoose = require("mongoose");
const ProductService = require("../../src/services/ProductService");
const Product = require("../../src/models/Product");
require("../../src/models/Category");

describe("ProductService", () => {
  beforeEach(() => {
    ProductService.destroyInstance();
  });

  afterEach(() => {
    ProductService.destroyInstance();
  });

  describe("getInstance", () => {
    it("should return the same instance (singleton)", () => {
      const instance1 = ProductService.getInstance();
      const instance2 = ProductService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("getProducts", () => {
    it("should return products with pagination", async () => {
      const userId = new mongoose.Types.ObjectId();
      
      await Product.create({ name: "Product 1", createdBy: userId });
      await Product.create({ name: "Product 2", createdBy: userId });

      const service = ProductService.getInstance();
      const result = await service.getProducts(0, 10);

      expect(result).toHaveLength(2);
    });

    it("should return empty array when no products", async () => {
      const service = ProductService.getInstance();
      const result = await service.getProducts(0, 10);

      expect(result).toHaveLength(0);
    });

    it("should respect skip and limit", async () => {
      const userId = new mongoose.Types.ObjectId();
      
      for (let i = 0; i < 5; i++) {
        await Product.create({ name: `Product ${i}`, createdBy: userId });
      }

      const service = ProductService.getInstance();
      const result = await service.getProducts(2, 2);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Product 2");
    });
  });

  describe("countProducts", () => {
    it("should return correct count", async () => {
      const userId = new mongoose.Types.ObjectId();
      
      await Product.create({ name: "Product 1", createdBy: userId });
      await Product.create({ name: "Product 2", createdBy: userId });

      const service = ProductService.getInstance();
      const result = await service.countProducts();

      expect(result).toBe(2);
    });

    it("should return 0 when no products", async () => {
      const service = ProductService.getInstance();
      const result = await service.countProducts();

      expect(result).toBe(0);
    });
  });

  describe("getProductById", () => {
    it("should return product by id", async () => {
      const userId = new mongoose.Types.ObjectId();
      const product = await Product.create({ name: "Test Product", createdBy: userId });

      const service = ProductService.getInstance();
      const result = await service.getProductById(product._id);

      expect(result).toBeTruthy();
      expect(result.name).toBe("Test Product");
    });

    it("should return null if product not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const service = ProductService.getInstance();
      const result = await service.getProductById(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe("createProduct", () => {
    it("should create a new product", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productData = { name: "New Product", createdBy: userId };

      const service = ProductService.getInstance();
      const result = await service.createProduct(productData);

      expect(result).toBeTruthy();
      expect(result.name).toBe("New Product");
      expect(result._id).toBeDefined();
    });
  });

  describe("destroyInstance", () => {
    it("should allow creating a new instance after destroying", () => {
      const instance1 = ProductService.getInstance();
      ProductService.destroyInstance();
      
      const instance2 = ProductService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });
});
