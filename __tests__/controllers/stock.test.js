const stockController = require("../../src/controllers/stock");

jest.mock("../../src/services/StockService");
jest.mock("../../src/services/LoggerService");

const StockService = require("../../src/services/StockService");
const LoggerService = require("../../src/services/LoggerService");

describe("StockController", () => {
  let mockReq;
  let mockRes;
  let mockStockService;
  let mockLoggerService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      query: {},
      body: {},
      params: {},
      requestId: "req123",
      userIp: "127.0.0.1",
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockLoggerService = {
      error: jest.fn(),
      warn: jest.fn(),
    };

    LoggerService.getInstance.mockReturnValue(mockLoggerService);

    mockStockService = {
      getStocks: jest.fn(),
      countStocks: jest.fn(),
      getStockById: jest.fn(),
      getStockByProductId: jest.fn(),
      createStock: jest.fn(),
      updateStock: jest.fn(),
      addStock: jest.fn(),
      removeStock: jest.fn(),
    };

    StockService.getInstance.mockReturnValue(mockStockService);
  });

  describe("getStocks", () => {
    it("should return paginated stocks", async () => {
      const mockStocks = [
        { _id: "1", quantity: 100, price: { amount: 25.99, coin: "$" } },
        { _id: "2", quantity: 50, price: { amount: 19.99, coin: "$" } }
      ];
      mockReq.query = { page: "1", limit: "10" };
      mockStockService.getStocks.mockResolvedValue({ stocks: mockStocks, total: 2 });

      await stockController.getStocks(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        stocks: mockStocks,
        total: 2,
      });
    });
  });

  describe("getStockById", () => {
    it("should return stock when found", async () => {
      const mockStock = { _id: "1", quantity: 100 };
      mockReq.params.stockId = "stock123";
      mockStockService.getStockById.mockResolvedValue(mockStock);

      await stockController.getStockById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ stock: mockStock });
    });

    it("should return 404 when stock not found", async () => {
      mockReq.params.stockId = "nonexistent";
      mockStockService.getStockById.mockResolvedValue(null);

      await stockController.getStockById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should return 404 on error", async () => {
      mockReq.params.stockId = "stock123";
      mockStockService.getStockById.mockRejectedValue(new Error("Error"));

      await stockController.getStockById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getStockByProductId", () => {
    it("should return stock when found", async () => {
      const mockStock = { _id: "1", quantity: 100 };
      mockReq.params.productId = "product123";
      mockStockService.getStockByProductId.mockResolvedValue(mockStock);

      await stockController.getStockByProductId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ stock: mockStock });
    });

    it("should return 404 when stock not found", async () => {
      mockReq.params.productId = "nonexistent";
      mockStockService.getStockByProductId.mockResolvedValue(null);

      await stockController.getStockByProductId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe("createStock", () => {
    it("should create stock successfully", async () => {
      const mockStock = { _id: "1", quantity: 100, minQuantity: 10 };
      mockReq.body = { productId: "product123", quantity: 100, minQuantity: 10, session: { _id: "user123" } };
      mockStockService.createStock.mockResolvedValue(mockStock);

      await stockController.createStock(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ stock: mockStock });
    });

    it("should return 400 on error", async () => {
      mockReq.body = { productId: "product123", session: { _id: "user123" } };
      mockStockService.createStock.mockRejectedValue(new Error("Error"));

      await stockController.createStock(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 4000 });
    });
  });

  describe("updateStock", () => {
    it("should update stock successfully", async () => {
      const mockStock = { _id: "1", quantity: 100, minQuantity: 20 };
      mockReq.params.stockId = "stock123";
      mockReq.body = { minQuantity: 20 };
      mockStockService.updateStock.mockResolvedValue(mockStock);

      await stockController.updateStock(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ stock: mockStock });
    });

    it("should return 404 when stock not found", async () => {
      mockReq.params.stockId = "nonexistent";
      mockReq.body = { minQuantity: 20 };
      mockStockService.updateStock.mockResolvedValue(null);

      await stockController.updateStock(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 on error", async () => {
      mockReq.params.stockId = "stock123";
      mockReq.body = { minQuantity: 20 };
      mockStockService.updateStock.mockRejectedValue(new Error("Error"));

      await stockController.updateStock(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("addStock", () => {
    it("should add stock successfully", async () => {
      const mockStock = { _id: "1", quantity: 150 };
      mockReq.params.stockId = "stock123";
      mockReq.body = { amount: 50 };
      mockStockService.addStock.mockResolvedValue(mockStock);

      await stockController.addStock(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ stock: mockStock });
    });

    it("should return 404 when stock not found", async () => {
      mockReq.params.stockId = "nonexistent";
      mockReq.body = { amount: 50 };
      mockStockService.addStock.mockResolvedValue(null);

      await stockController.addStock(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe("removeStock", () => {
    it("should remove stock successfully", async () => {
      const mockStock = { _id: "1", quantity: 50 };
      mockReq.params.stockId = "stock123";
      mockReq.body = { amount: 50, session: { _id: "user123" } };
      mockStockService.removeStock.mockResolvedValue(mockStock);

      await stockController.removeStock(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ stock: mockStock });
    });

    it("should return 400 when would go below minimum stock", async () => {
      mockReq.params.stockId = "stock123";
      mockReq.body = { amount: 100, session: { _id: "user123" } };
      mockStockService.removeStock.mockResolvedValue(null);

      await stockController.removeStock(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 4002, message: "Cannot remove: would go below minimum stock" });
    });
  });
});
