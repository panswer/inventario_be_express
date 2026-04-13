const productController = require("../../src/controllers/product");

jest.mock("../../src/services/ProductService");
jest.mock("../../src/services/PriceService");
jest.mock("../../src/utils/fileUpload");

const ProductService = require("../../src/services/ProductService");
const PriceService = require("../../src/services/PriceService");
const { saveProductImage, deleteProductImage } = require("../../src/utils/fileUpload");

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
      files: null,
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
      findByBarcode: jest.fn(),
    };

    mockPriceService = {
      createPrice: jest.fn(),
      getPriceByProductId: jest.fn(),
    };

    ProductService.getInstance.mockReturnValue(mockProductService);
    PriceService.getInstance.mockReturnValue(mockPriceService);
    saveProductImage.mockReturnValue("test-image.jpg");
    deleteProductImage.mockImplementation(() => {});
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

      expect(mockProductService.getProducts).toHaveBeenCalledWith(0, 10, undefined, undefined);
    });

    it("should skip items correctly for page 2", async () => {
      mockReq.query = { page: "2", limit: "10" };
      mockProductService.getProducts.mockResolvedValue([]);
      mockProductService.countProducts.mockResolvedValue(0);

      await productController.getProducts(mockReq, mockRes);

      expect(mockProductService.getProducts).toHaveBeenCalledWith(10, 10, undefined, undefined);
    });

    it("should skip items correctly for page 3", async () => {
      mockReq.query = { page: "3", limit: "10" };
      mockProductService.getProducts.mockResolvedValue([]);
      mockProductService.countProducts.mockResolvedValue(0);

      await productController.getProducts(mockReq, mockRes);

      expect(mockProductService.getProducts).toHaveBeenCalledWith(20, 10, undefined, undefined);
    });

    it("should calculate skip with custom limit", async () => {
      mockReq.query = { page: "2", limit: "20" };
      mockProductService.getProducts.mockResolvedValue([]);
      mockProductService.countProducts.mockResolvedValue(0);

      await productController.getProducts(mockReq, mockRes);

      expect(mockProductService.getProducts).toHaveBeenCalledWith(20, 20, undefined, undefined);
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

    it("should create product with image", async () => {
      const mockProduct = { _id: "product123", name: "Test", image: "/uploads/test-image.jpg" };
      const mockPrice = { _id: "price123", amount: 100 };
      mockReq.body = { 
        name: "Test", 
        amount: 100, 
        coin: "USD", 
        session: { _id: "user123" } 
      };
      mockReq.files = {
        image: {
          tempFilePath: "/tmp/test-image.jpg",
          mimetype: "image/jpeg",
        },
      };
      mockProductService.createProduct.mockResolvedValue(mockProduct);
      mockPriceService.createPrice.mockResolvedValue(mockPrice);

      await productController.createProduct(mockReq, mockRes);

      expect(saveProductImage).toHaveBeenCalledWith(mockReq.files.image);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("should delete image if product creation fails after image save", async () => {
      mockReq.body = { name: "Test", session: { _id: "user123" } };
      mockReq.files = {
        image: {
          tempFilePath: "/tmp/test-image.jpg",
          mimetype: "image/jpeg",
        },
      };
      mockProductService.createProduct.mockRejectedValue(new Error("Error"));

      await productController.createProduct(mockReq, mockRes);

      expect(deleteProductImage).toHaveBeenCalledWith("test-image.jpg");
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 2000 });
    });

    it("should return 400 if image save fails", async () => {
      mockReq.body = { 
        name: "Test", 
        amount: 100, 
        coin: "USD", 
        session: { _id: "user123" } 
      };
      mockReq.files = {
        image: {
          tempFilePath: "/tmp/test-image.jpg",
          mimetype: "image/jpeg",
        },
      };
      saveProductImage.mockImplementation(() => {
        throw new Error("Invalid format");
      });

      await productController.createProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 2001 });
    });
  });

  describe("updateProductById", () => {
    it("should return 404 if product not found", async () => {
      mockReq.params.productId = "nonexistent";
      mockProductService.getProductById.mockResolvedValue(null);

      await productController.updateProductById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
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

    it("should update product with new image and delete old image", async () => {
      const mockProduct = { 
        _id: "1", 
        name: "Test", 
        image: "old-image.jpg",
        save: jest.fn().mockResolvedValue(true) 
      };
      mockReq.params.productId = "1";
      mockReq.body = { name: "Updated Name" };
      mockReq.files = {
        image: {
          tempFilePath: "/tmp/new-image.jpg",
          mimetype: "image/jpeg",
        },
      };
      mockProductService.getProductById.mockResolvedValue(mockProduct);

      await productController.updateProductById(mockReq, mockRes);

      expect(saveProductImage).toHaveBeenCalledWith(mockReq.files.image);
      expect(deleteProductImage).toHaveBeenCalledWith("old-image.jpg");
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should return 400 if image save fails", async () => {
      const mockProduct = { 
        _id: "1", 
        name: "Test", 
        save: jest.fn() 
      };
      mockReq.params.productId = "1";
      mockReq.body = { name: "Updated Name" };
      mockReq.files = {
        image: {
          tempFilePath: "/tmp/test-image.jpg",
          mimetype: "image/jpeg",
        },
      };
      mockProductService.getProductById.mockResolvedValue(mockProduct);
      saveProductImage.mockImplementation(() => {
        throw new Error("Invalid format");
      });

      await productController.updateProductById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 2001 });
    });
  });

  describe("getProductByBarcode", () => {
    it("should return 404 if product not found", async () => {
      mockReq.params.barcode = "nonexistent";
      mockProductService.findByBarcode.mockResolvedValue(null);

      await productController.getProductByBarcode(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Product not found" });
    });

    it("should return product and price if found", async () => {
      const mockProduct = { _id: "1", name: "Test Product", barcode: "123" };
      const mockPrice = { _id: "price1", amount: 100 };
      mockReq.params.barcode = "123";
      mockProductService.findByBarcode.mockResolvedValue(mockProduct);
      mockPriceService.getPriceByProductId.mockResolvedValue(mockPrice);

      await productController.getProductByBarcode(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ product: mockProduct, price: mockPrice });
    });

    it("should return product without price if price lookup fails", async () => {
      const mockProduct = { _id: "1", name: "Test Product", barcode: "123" };
      mockReq.params.barcode = "123";
      mockProductService.findByBarcode.mockResolvedValue(mockProduct);
      mockPriceService.getPriceByProductId.mockRejectedValue(new Error("Error"));

      await productController.getProductByBarcode(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ product: mockProduct, price: undefined });
    });

    it("should return 500 if findByBarcode throws error", async () => {
      mockReq.params.barcode = "123";
      mockProductService.findByBarcode.mockRejectedValue(new Error("DB Error"));

      await productController.getProductByBarcode(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Internal error" });
    });
  });
});
