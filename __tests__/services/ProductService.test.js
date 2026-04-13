const mongoose = require("mongoose");
const ProductService = require("../../src/services/ProductService");
const Product = require("../../src/models/Product");
const Stock = require("../../src/models/Stock");
const Warehouse = require("../../src/models/Warehouse");
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

  describe("getProducts with warehouseId", () => {
    let userId;
    let warehouseId;

    beforeEach(async () => {
      userId = new mongoose.Types.ObjectId();
      const warehouse = await Warehouse.create({
        name: "Test Warehouse",
        address: "Test Address",
        createdBy: userId,
      });
      warehouseId = warehouse._id;
    });

    it("should return products with stock info when warehouseId provided", async () => {
      const product = await Product.create({ name: "Product with Stock", createdBy: userId });
      await Stock.create({
        productId: product._id,
        warehouseId: warehouseId,
        quantity: 50,
        minQuantity: 10,
        createdBy: userId,
      });

      const service = ProductService.getInstance();
      const result = await service.getProducts(0, 10, undefined, warehouseId);

      expect(result).toHaveLength(1);
      expect(result[0].stock).toBeDefined();
      expect(result[0].stock.quantity).toBe(50);
      expect(result[0].stock.minQuantity).toBe(10);
    });

    it("should return products with stock.quantity = 0 when no stock exists", async () => {
      await Product.create({ name: "Product without Stock", createdBy: userId });

      const service = ProductService.getInstance();
      const result = await service.getProducts(0, 10, undefined, warehouseId);

      expect(result).toHaveLength(1);
      expect(result[0].stock).toBeDefined();
      expect(result[0].stock.quantity).toBe(0);
      expect(result[0].stock.minQuantity).toBe(0);
    });

    it("should respect pagination with warehouseId", async () => {
      for (let i = 0; i < 5; i++) {
        const product = await Product.create({ name: `Product ${i}`, createdBy: userId });
        await Stock.create({
          productId: product._id,
          warehouseId: warehouseId,
          quantity: i * 10,
          minQuantity: 5,
          createdBy: userId,
        });
      }

      const service = ProductService.getInstance();
      const result = await service.getProducts(2, 2, undefined, warehouseId);

      expect(result).toHaveLength(2);
    });

    it("should return multiple products with stock", async () => {
      const product1 = await Product.create({ name: "Product 1", createdBy: userId });
      const product2 = await Product.create({ name: "Product 2", createdBy: userId });

      await Stock.create({
        productId: product1._id,
        warehouseId: warehouseId,
        quantity: 10,
        minQuantity: 5,
        createdBy: userId,
      });
      await Stock.create({
        productId: product2._id,
        warehouseId: warehouseId,
        quantity: 20,
        minQuantity: 5,
        createdBy: userId,
      });

      const service = ProductService.getInstance();
      const result = await service.getProducts(0, 10, undefined, warehouseId);

      expect(result).toHaveLength(2);
      expect(result[0].stock.quantity).toBe(10);
      expect(result[1].stock.quantity).toBe(20);
    });
  });

  describe("countProducts with warehouseId", () => {
    let userId;
    let warehouseId;

    beforeEach(async () => {
      userId = new mongoose.Types.ObjectId();
      const warehouse = await Warehouse.create({
        name: "Test Warehouse",
        address: "Test Address",
        createdBy: userId,
      });
      warehouseId = warehouse._id;
    });

    it("should return correct count with warehouseId", async () => {
      const product1 = await Product.create({ name: "Product 1", createdBy: userId });
      const product2 = await Product.create({ name: "Product 2", createdBy: userId });

      await Stock.create({
        productId: product1._id,
        warehouseId: warehouseId,
        quantity: 10,
        minQuantity: 5,
        createdBy: userId,
      });
      await Stock.create({
        productId: product2._id,
        warehouseId: warehouseId,
        quantity: 20,
        minQuantity: 5,
        createdBy: userId,
      });

      const service = ProductService.getInstance();
      const result = await service.countProducts(undefined, warehouseId);

      expect(result).toBe(2);
    });

    it("should return 0 when no products in warehouse", async () => {
      await Product.create({ name: "Product without Stock", createdBy: userId });

      const service = ProductService.getInstance();
      const result = await service.countProducts(undefined, warehouseId);

      expect(result).toBe(0);
    });

    it("should return multiple products count with warehouseId", async () => {
      const product1 = await Product.create({ name: "Product 1", createdBy: userId });
      const product2 = await Product.create({ name: "Product 2", createdBy: userId });

      await Stock.create({
        productId: product1._id,
        warehouseId: warehouseId,
        quantity: 10,
        minQuantity: 5,
        createdBy: userId,
      });
      await Stock.create({
        productId: product2._id,
        warehouseId: warehouseId,
        quantity: 20,
        minQuantity: 5,
        createdBy: userId,
      });

      const service = ProductService.getInstance();
      const result = await service.countProducts(undefined, warehouseId);

      expect(result).toBe(2);
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
