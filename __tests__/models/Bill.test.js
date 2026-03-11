const mongoose = require("mongoose");
const Bill = require("../../src/models/Bill");

describe("Bill Model", () => {
  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe("Schema Validation", () => {
    it("should throw error when userId is missing", async () => {
      const bill = new Bill({});

      await expect(bill.save()).rejects.toThrow("user's id is required");
    });

    it("should create bill with valid userId", async () => {
      const userId = new mongoose.Types.ObjectId();
      const bill = new Bill({ userId });

      const savedBill = await bill.save();

      expect(savedBill.userId).toEqual(userId);
      expect(savedBill._id).toBeDefined();
    });
  });

  describe("toJSON Transform", () => {
    it("should convert createdAt to timestamp in toJSON", async () => {
      const userId = new mongoose.Types.ObjectId();
      const bill = new Bill({ userId });
      await bill.save();

      const json = bill.toJSON();

      expect(json.createdAt).toBeDefined();
      expect(typeof json.createdAt).toBe("number");
    });

    it("should convert updatedAt to timestamp in toJSON", async () => {
      const userId = new mongoose.Types.ObjectId();
      const bill = new Bill({ userId });
      await bill.save();

      const json = bill.toJSON();

      expect(json.updatedAt).toBeDefined();
      expect(typeof json.updatedAt).toBe("number");
    });
  });

  describe("Timestamps", () => {
    it("should have createdAt and updatedAt fields", async () => {
      const userId = new mongoose.Types.ObjectId();
      const bill = await Bill.create({ userId });

      expect(bill.createdAt).toBeDefined();
      expect(bill.updatedAt).toBeDefined();
    });
  });
});
