const mongoose = require("mongoose");
const BillService = require("../../src/services/BillService");
const Bill = require("../../src/models/Bill");
const Sale = require("../../src/models/Sale");

describe("BillService", () => {
  beforeEach(() => {
    BillService.destroyInstance();
  });

  afterEach(() => {
    BillService.destroyInstance();
  });

  describe("getInstance", () => {
    it("should return the same instance (singleton)", () => {
      const instance1 = BillService.getInstance();
      const instance2 = BillService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("createBill", () => {
    it("should create a new bill", async () => {
      const userId = new mongoose.Types.ObjectId();

      const service = BillService.getInstance();
      const result = await service.createBill(userId);

      expect(result).toBeTruthy();
      expect(result.userId.toString()).toEqual(userId.toString());
      expect(result._id).toBeDefined();
    });
  });

  describe("getBills", () => {
    it("should return bills with pagination", async () => {
      const userId = new mongoose.Types.ObjectId();
      
      await Bill.create({ userId });
      await Bill.create({ userId });

      const service = BillService.getInstance();
      const result = await service.getBills(0, 10);

      expect(result).toHaveLength(2);
    });

    it("should return empty array when no bills", async () => {
      const service = BillService.getInstance();
      const result = await service.getBills(0, 10);

      expect(result).toHaveLength(0);
    });

    it("should respect skip and limit", async () => {
      const userId = new mongoose.Types.ObjectId();
      
      for (let i = 0; i < 5; i++) {
        await Bill.create({ userId });
      }

      const service = BillService.getInstance();
      const result = await service.getBills(2, 2);

      expect(result).toHaveLength(2);
    });
  });

  describe("countBills", () => {
    it("should return correct count", async () => {
      const userId = new mongoose.Types.ObjectId();
      
      await Bill.create({ userId });
      await Bill.create({ userId });

      const service = BillService.getInstance();
      const result = await service.countBills();

      expect(result).toBe(2);
    });

    it("should return 0 when no bills", async () => {
      const service = BillService.getInstance();
      const result = await service.countBills();

      expect(result).toBe(0);
    });
  });

  describe("getBillDetailById", () => {
    it("should return bill detail with sales", async () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();
      
      const bill = await Bill.create({ userId });
      
      await Sale.create({
        billId: bill._id,
        productId,
        count: 2,
        price: 50,
        coin: "$",
      });

      const service = BillService.getInstance();
      const result = await service.getBillDetailById(bill._id.toString());

      expect(result).toBeTruthy();
      expect(result.sales).toHaveLength(1);
      expect(result.total).toBe(100);
    });
  });

  describe("destroyInstance", () => {
    it("should allow creating a new instance after destroying", () => {
      const instance1 = BillService.getInstance();
      BillService.destroyInstance();
      
      const instance2 = BillService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });
});
