const mongoose = require("mongoose");
const Supplier = require("../../src/models/Supplier");

describe("Supplier Model", () => {
  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe("Schema Validation", () => {
    it("should throw error when name is missing", async () => {
      const userId = new mongoose.Types.ObjectId();
      const supplier = new Supplier({ rif: "J-12345678-9", createdBy: userId });

      await expect(supplier.save()).rejects.toThrow("name is required");
    });

    it("should throw error when rif is missing", async () => {
      const userId = new mongoose.Types.ObjectId();
      const supplier = new Supplier({ name: "Test Supplier", createdBy: userId });

      await expect(supplier.save()).rejects.toThrow("rif is required");
    });

    it("should throw error when createdBy is missing", async () => {
      const supplier = new Supplier({ name: "Test Supplier", rif: "J-12345678-9" });

      await expect(supplier.save()).rejects.toThrow("createdBy is required");
    });

    it("should create supplier with valid data", async () => {
      const userId = new mongoose.Types.ObjectId();
      const supplier = new Supplier({
        name: "Test Supplier",
        rif: "J-12345678-9",
        createdBy: userId,
      });

      const savedSupplier = await supplier.save();

      expect(savedSupplier.name).toBe("Test Supplier");
      expect(savedSupplier.rif).toBe("J-12345678-9");
      expect(savedSupplier.createdBy).toEqual(userId);
      expect(savedSupplier._id).toBeDefined();
    });
  });

  describe("Default Values", () => {
    it("should default isEnabled to true", async () => {
      const userId = new mongoose.Types.ObjectId();
      const supplier = new Supplier({
        name: "Test Supplier",
        rif: "J-12345678-9",
        createdBy: userId,
      });

      const savedSupplier = await supplier.save();

      expect(savedSupplier.isEnabled).toBe(true);
    });

    it("should allow isEnabled to be set to false", async () => {
      const userId = new mongoose.Types.ObjectId();
      const supplier = new Supplier({
        name: "Test Supplier",
        rif: "J-12345678-9",
        createdBy: userId,
        isEnabled: false,
      });

      const savedSupplier = await supplier.save();

      expect(savedSupplier.isEnabled).toBe(false);
    });

    it("should allow optional fields to be set", async () => {
      const userId = new mongoose.Types.ObjectId();
      const supplier = new Supplier({
        name: "Test Supplier",
        rif: "J-12345678-9",
        createdBy: userId,
        phone: "04141234567",
        address: "Test Address",
        contactPerson: "John Doe",
      });

      const savedSupplier = await supplier.save();

      expect(savedSupplier.phone).toBe("04141234567");
      expect(savedSupplier.address).toBe("Test Address");
      expect(savedSupplier.contactPerson).toBe("John Doe");
    });
  });

  describe("Unique Index", () => {
    it("should throw error for duplicate rif", async () => {
      const userId = new mongoose.Types.ObjectId();
      await Supplier.create({
        name: "Supplier 1",
        rif: "J-12345678-9",
        createdBy: userId,
      });

      const supplier = new Supplier({
        name: "Supplier 2",
        rif: "J-12345678-9",
        createdBy: userId,
      });

      await expect(supplier.save()).rejects.toThrow();
    });
  });

  describe("toJSON Transform", () => {
    it("should convert createdAt to timestamp in toJSON", async () => {
      const userId = new mongoose.Types.ObjectId();
      const supplier = new Supplier({
        name: "Test Supplier",
        rif: "J-12345678-9",
        createdBy: userId,
      });
      await supplier.save();

      const json = supplier.toJSON();

      expect(json.createdAt).toBeDefined();
      expect(typeof json.createdAt).toBe("number");
    });

    it("should convert updatedAt to timestamp in toJSON", async () => {
      const userId = new mongoose.Types.ObjectId();
      const supplier = new Supplier({
        name: "Test Supplier",
        rif: "J-12345678-9",
        createdBy: userId,
      });
      await supplier.save();

      const json = supplier.toJSON();

      expect(json.updatedAt).toBeDefined();
      expect(typeof json.updatedAt).toBe("number");
    });
  });

  describe("Timestamps", () => {
    it("should have createdAt and updatedAt fields", async () => {
      const userId = new mongoose.Types.ObjectId();
      const supplier = await Supplier.create({
        name: "Test Supplier",
        rif: "J-12345678-9",
        createdBy: userId,
      });

      expect(supplier.createdAt).toBeDefined();
      expect(supplier.updatedAt).toBeDefined();
    });
  });
});
