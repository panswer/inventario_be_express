const productController = require("../../src/controllers/product");

jest.mock("../../src/services/ProductService");
jest.mock("../../src/services/PriceService");

const ProductService = require("../../src/services/ProductService");
const PriceService = require("../../src/services/PriceService");

describe("ProductController", () => {
  let mockReq;
  let mockRes;
  let mockProductService;
  let mockPriceService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      query: {},
      body: {},
      params: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockProductService = {
      getProducts: jest.fn(),
      getProductById: jest.fn(),
      createProduct: jest.fn(),
      countProducts: jest.fn(),
    };

    mockPriceService = {
      createPrice: jest.fn(),
    };

    ProductService.getInstance.mockReturnValue(mockProductService);
    PriceService.getInstance.mockReturnValue(mockPriceService);
  });

  describe("getProducts", () => {
    it("should return products with pagination", async () => {
      const mockProducts = [{ _id: "1", name: "Product 1" }];
      mockReq.query = { page: "1", limit: "10" };
      mockProductService.getProducts.mockResolvedValue(mockProducts);
      mockProductService.countProducts.mockResolvedValue(1);

      await productController.getProducts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        products: mockProducts,
        total: 1,
      });
    });

    it("should use default pagination values", async () => {
      mockProductService.getProducts.mockResolvedValue([]);
      mockProductService.countProducts.mockResolvedValue(0);

      await productController.getProducts(mockReq, mockRes);

      expect(mockProductService.getProducts).toHaveBeenCalledWith(0, 10);
    });
  });

  describe("getProductById", () => {
    it("should return product if found", async () => {
      const mockProduct = { _id: "1", name: "Test Product" };
      mockReq.params.productId = "1";
      mockProductService.getProductById.mockResolvedValue(mockProduct);

      await productController.getProductById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ product: mockProduct });
    });

    it("should return 200 even if product is null (current behavior)", async () => {
      mockReq.params.productId = "nonexistent";
      mockProductService.getProductById.mockResolvedValue(null);

      await productController.getProductById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ product: null });
    });
  });

  describe("createProduct", () => {
    it("should return 400 if product creation fails", async () => {
      mockReq.body = { name: "Test", session: { _id: "user123" } };
      mockProductService.createProduct.mockRejectedValue(new Error("Error"));

      await productController.createProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 2000 });
    });

    it("should return 400 if price creation fails", async () => {
      mockReq.body = { 
        name: "Test", 
        amount: 100, 
        coin: "USD", 
        session: { _id: "user123" } 
      };
      mockProductService.createProduct.mockResolvedValue({ _id: "product123" });
      mockPriceService.createPrice.mockRejectedValue(new Error("Error"));

      await productController.createProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 3000 });
    });

    it("should create product and price successfully", async () => {
      const mockProduct = { _id: "product123", name: "Test" };
      const mockPrice = { _id: "price123", amount: 100 };
      mockReq.body = { 
        name: "Test", 
        amount: 100, 
        coin: "USD", 
        session: { _id: "user123" } 
      };
      mockProductService.createProduct.mockResolvedValue(mockProduct);
      mockPriceService.createPrice.mockResolvedValue(mockPrice);

      await productController.createProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ product: mockProduct, price: mockPrice });
    });
  });

  describe("updateProductById", () => {
    it("should return 404 if product not found", async () => {
      mockReq.params.productId = "nonexistent";
      mockProductService.getProductById.mockResolvedValue(null);

      await productController.updateProductById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 for invalid name", async () => {
      const mockProduct = { _id: "1", name: "Test", save: jest.fn() };
      mockReq.params.productId = "1";
      mockReq.body = { name: "ab" };
      mockProductService.getProductById.mockResolvedValue(mockProduct);

      await productController.updateProductById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Name is not valid" });
    });

    it("should update product successfully", async () => {
      const mockProduct = { _id: "1", name: "Test", save: jest.fn().mockResolvedValue(true) };
      mockReq.params.productId = "1";
      mockReq.body = { name: "Updated Name" };
      mockProductService.getProductById.mockResolvedValue(mockProduct);

      await productController.updateProductById(mockReq, mockRes);

      expect(mockProduct.name).toBe("Updated Name");
      expect(mockProduct.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
