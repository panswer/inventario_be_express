const priceController = require("../../src/controllers/price");

jest.mock("../../src/services/PriceService");

const PriceService = require("../../src/services/PriceService");

describe("PriceController", () => {
  let mockReq;
  let mockRes;
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

    mockPriceService = {
      getPriceByProductId: jest.fn(),
      getPriceByIdAndCoin: jest.fn(),
    };

    PriceService.getInstance.mockReturnValue(mockPriceService);
  });

  describe("getPriceCoinAll", () => {
    it("should return all coin types", async () => {
      await priceController.getPriceCoinAll(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        coins: ["$", "Brs."],
      });
    });
  });

  describe("getPriceByProductId", () => {
    it("should return price when found", async () => {
      const mockPrice = { _id: "1", amount: 100, coin: "$" };
      mockReq.params.productId = "product123";
      mockPriceService.getPriceByProductId.mockResolvedValue(mockPrice);

      await priceController.getPriceByProductId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ price: mockPrice });
    });

    it("should return 500 when price not found (error)", async () => {
      mockReq.params.productId = "nonexistent";
      mockPriceService.getPriceByProductId.mockRejectedValue(new Error("Error"));

      await priceController.getPriceByProductId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("updatePriceById", () => {
    it("should return 404 if price not found", async () => {
      mockReq.params.priceId = "nonexistent";
      mockReq.params.coin = "$";
      mockPriceService.getPriceByIdAndCoin.mockResolvedValue(null);

      await priceController.updatePriceById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 if coin type not valid", async () => {
      const mockPrice = { _id: "1", amount: 100, coin: "$", save: jest.fn() };
      mockReq.params.priceId = "price123";
      mockReq.params.coin = "INVALID";
      mockReq.body = { amount: 50 };
      mockPriceService.getPriceByIdAndCoin.mockResolvedValue(mockPrice);

      await priceController.updatePriceById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Coin type not valid" });
    });

    it("should update price successfully", async () => {
      const mockPrice = { _id: "1", amount: 100, coin: "$", save: jest.fn().mockResolvedValue(true) };
      mockReq.params.priceId = "price123";
      mockReq.params.coin = "$";
      mockReq.body = { amount: 50 };
      mockPriceService.getPriceByIdAndCoin.mockResolvedValue(mockPrice);

      await priceController.updatePriceById(mockReq, mockRes);

      expect(mockPrice.amount).toBe(50);
      expect(mockPrice.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(202);
    });

    it("should return 500 if save fails", async () => {
      const mockPrice = { _id: "1", amount: 100, coin: "$", save: jest.fn().mockRejectedValue(new Error("Error")) };
      mockReq.params.priceId = "price123";
      mockReq.params.coin = "$";
      mockReq.body = { amount: 50 };
      mockPriceService.getPriceByIdAndCoin.mockResolvedValue(mockPrice);

      await priceController.updatePriceById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
