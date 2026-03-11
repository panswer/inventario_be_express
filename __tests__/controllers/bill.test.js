const billController = require("../../src/controllers/bill");

jest.mock("../../src/services/BillService");
jest.mock("../../src/services/SaleService");

const BillService = require("../../src/services/BillService");
const SaleService = require("../../src/services/SaleService");

describe("BillController", () => {
  let mockReq;
  let mockRes;
  let mockBillService;
  let mockSaleService;

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

    mockBillService = {
      createBill: jest.fn(),
      getBills: jest.fn(),
      countBills: jest.fn(),
      getBillDetailById: jest.fn(),
    };

    mockSaleService = {
      createSale: jest.fn(),
    };

    BillService.getInstance.mockReturnValue(mockBillService);
    SaleService.getInstance.mockReturnValue(mockSaleService);
  });

  describe("createBill", () => {
    it("should create bill and sales successfully", async () => {
      const mockBill = { _id: "bill123" };
      mockReq.body = {
        session: { _id: "user123" },
        sellers: [
          { productId: "product1", count: 2, price: 50, coin: "$" },
        ],
      };
      mockBillService.createBill.mockResolvedValue(mockBill);
      mockSaleService.createSale.mockResolvedValue(true);

      await billController.createBill(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: true });
    });

    it("should return 500 if bill creation fails", async () => {
      mockReq.body = {
        session: { _id: "user123" },
        sellers: [
          { productId: "product1", count: 2, price: 50, coin: "$" },
        ],
      };
      mockBillService.createBill.mockRejectedValue(new Error("Error"));

      await billController.createBill(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 if sale creation fails", async () => {
      const mockBill = { _id: "bill123" };
      mockReq.body = {
        session: { _id: "user123" },
        sellers: [
          { productId: "product1", count: 2, price: 50, coin: "$" },
        ],
      };
      mockBillService.createBill.mockResolvedValue(mockBill);
      mockSaleService.createSale.mockRejectedValue(new Error("Error"));

      await billController.createBill(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getAllBills", () => {
    it("should return bills with pagination", async () => {
      const mockBills = [{ _id: "bill1" }, { _id: "bill2" }];
      mockReq.query = { page: "1", limit: "10" };
      mockBillService.getBills.mockResolvedValue(mockBills);
      mockBillService.countBills.mockResolvedValue(2);

      await billController.getAllBills(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        bills: mockBills,
        total: 2,
      });
    });

    it("should use default pagination values", async () => {
      mockReq.query = {};
      mockBillService.getBills.mockResolvedValue([]);
      mockBillService.countBills.mockResolvedValue(0);

      await billController.getAllBills(mockReq, mockRes);

      expect(mockBillService.getBills).toHaveBeenCalledWith(0, 10);
    });
  });

  describe("getBillDetailByBillId", () => {
    it("should return bill detail", async () => {
      const mockBillDetail = { _id: "bill1", total: 100 };
      mockReq.params.billId = "bill123";
      mockBillService.getBillDetailById.mockResolvedValue(mockBillDetail);

      await billController.getBillDetailByBillId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ billDetail: mockBillDetail });
    });
  });
});
