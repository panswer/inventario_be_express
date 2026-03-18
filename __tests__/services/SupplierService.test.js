const mongoose = require("mongoose");
const SupplierService = require("../../src/services/SupplierService");
const Supplier = require("../../src/models/Supplier");

describe("SupplierService", () => {
  beforeEach(() => {
    SupplierService.destroyInstance();
  });

  afterEach(async () => {
    SupplierService.destroyInstance();
  });

  describe("getInstance", () => {
    it("should return the same instance (singleton)", () => {
      const instance1 = SupplierService.getInstance();
      const instance2 = SupplierService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("getSuppliers", () => {
    it("should return all suppliers when no filter", async () => {
      const userId = new mongoose.Types.ObjectId();
      
      await Supplier.create({ name: "Supplier 1", rif: "J-11111111-1", createdBy: userId, isEnabled: true });
      await Supplier.create({ name: "Supplier 2", rif: "J-22222222-2", createdBy: userId, isEnabled: false });

      const service = SupplierService.getInstance();
      const result = await service.getSuppliers();

      expect(result).toHaveLength(2);
    });

    it("should return only enabled suppliers when filter enabled", async () => {
      const userId = new mongoose.Types.ObjectId();
      
      await Supplier.create({ name: "Supplier 1", rif: "J-11111111-1", createdBy: userId, isEnabled: true });
      await Supplier.create({ name: "Supplier 2", rif: "J-22222222-2", createdBy: userId, isEnabled: false });

      const service = SupplierService.getInstance();
      const result = await service.getSuppliers(true);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Supplier 1");
    });

    it("should return empty array when no suppliers", async () => {
      const service = SupplierService.getInstance();
      const result = await service.getSuppliers();

      expect(result).toHaveLength(0);
    });
  });

  describe("getSupplierById", () => {
    it("should return supplier by id", async () => {
      const userId = new mongoose.Types.ObjectId();
      const supplier = await Supplier.create({ name: "Test Supplier", rif: "J-12345678-9", createdBy: userId });

      const service = SupplierService.getInstance();
      const result = await service.getSupplierById(supplier._id);

      expect(result).toBeTruthy();
      expect(result.name).toBe("Test Supplier");
    });

    it("should return null if supplier not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const service = SupplierService.getInstance();
      const result = await service.getSupplierById(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe("getSupplierByRif", () => {
    it("should return supplier by exact rif", async () => {
      const userId = new mongoose.Types.ObjectId();
      await Supplier.create({ name: "Test Supplier", rif: "J-12345678-9", createdBy: userId });

      const service = SupplierService.getInstance();
      const result = await service.getSupplierByRif("J-12345678-9");

      expect(result).toBeTruthy();
      expect(result.rif).toBe("J-12345678-9");
    });

    it("should be case-insensitive", async () => {
      const userId = new mongoose.Types.ObjectId();
      await Supplier.create({ name: "Test Supplier", rif: "J-12345678-9", createdBy: userId });

      const service = SupplierService.getInstance();
      const result = await service.getSupplierByRif("j-12345678-9");

      expect(result).toBeTruthy();
      expect(result.rif).toBe("J-12345678-9");
    });

    it("should return null if supplier not found", async () => {
      const service = SupplierService.getInstance();
      const result = await service.getSupplierByRif("J-00000000-0");

      expect(result).toBeNull();
    });
  });

  describe("createSupplier", () => {
    it("should create a new supplier", async () => {
      const userId = new mongoose.Types.ObjectId();
      const supplierData = { name: "New Supplier", rif: "J-12345678-9", createdBy: userId };

      const service = SupplierService.getInstance();
      const result = await service.createSupplier(supplierData);

      expect(result).toBeTruthy();
      expect(result.name).toBe("New Supplier");
      expect(result.rif).toBe("J-12345678-9");
      expect(result.isEnabled).toBe(true);
      expect(result._id).toBeDefined();
    });

    it("should create supplier with optional fields", async () => {
      const userId = new mongoose.Types.ObjectId();
      const supplierData = { 
        name: "New Supplier", 
        rif: "J-12345678-9", 
        phone: "04141234567",
        address: "Test Address",
        contactPerson: "John Doe",
        createdBy: userId 
      };

      const service = SupplierService.getInstance();
      const result = await service.createSupplier(supplierData);

      expect(result).toBeTruthy();
      expect(result.phone).toBe("04141234567");
      expect(result.address).toBe("Test Address");
      expect(result.contactPerson).toBe("John Doe");
    });
  });

  describe("updateSupplierById", () => {
    it("should update supplier name", async () => {
      const userId = new mongoose.Types.ObjectId();
      const supplier = await Supplier.create({ name: "Old Name", rif: "J-12345678-9", createdBy: userId });

      const service = SupplierService.getInstance();
      const result = await service.updateSupplierById(supplier._id, { name: "New Name" });

      expect(result).toBeTruthy();
      expect(result.name).toBe("New Name");
    });

    it("should update multiple fields", async () => {
      const userId = new mongoose.Types.ObjectId();
      const supplier = await Supplier.create({ name: "Old Name", rif: "J-12345678-9", createdBy: userId });

      const service = SupplierService.getInstance();
      const result = await service.updateSupplierById(supplier._id, { 
        name: "New Name", 
        phone: "04141234567" 
      });

      expect(result).toBeTruthy();
      expect(result.name).toBe("New Name");
      expect(result.phone).toBe("04141234567");
    });

    it("should return null if supplier not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const service = SupplierService.getInstance();
      const result = await service.updateSupplierById(nonExistentId, { name: "New Name" });

      expect(result).toBeNull();
    });
  });

  describe("toggleSupplier", () => {
    it("should disable enabled supplier", async () => {
      const userId = new mongoose.Types.ObjectId();
      const supplier = await Supplier.create({ name: "Test Supplier", rif: "J-12345678-9", createdBy: userId, isEnabled: true });

      const service = SupplierService.getInstance();
      const result = await service.toggleSupplier(supplier._id);

      expect(result).toBeTruthy();
      expect(result.isEnabled).toBe(false);
    });

    it("should enable disabled supplier", async () => {
      const userId = new mongoose.Types.ObjectId();
      const supplier = await Supplier.create({ name: "Test Supplier", rif: "J-12345678-9", createdBy: userId, isEnabled: false });

      const service = SupplierService.getInstance();
      const result = await service.toggleSupplier(supplier._id);

      expect(result).toBeTruthy();
      expect(result.isEnabled).toBe(true);
    });

    it("should return null if supplier not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const service = SupplierService.getInstance();
      const result = await service.toggleSupplier(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe("getSuppliersByIds", () => {
    it("should return suppliers by IDs", async () => {
      const userId = new mongoose.Types.ObjectId();
      const sup1 = await Supplier.create({ name: "Supplier 1", rif: "J-11111111-1", createdBy: userId });
      const sup2 = await Supplier.create({ name: "Supplier 2", rif: "J-22222222-2", createdBy: userId });

      const service = SupplierService.getInstance();
      const result = await service.getSuppliersByIds([sup1._id.toString(), sup2._id.toString()]);

      expect(result).toHaveLength(2);
    });

    it("should return empty array when no matches", async () => {
      const service = SupplierService.getInstance();
      const result = await service.getSuppliersByIds([new mongoose.Types.ObjectId().toString()]);

      expect(result).toHaveLength(0);
    });
  });

  describe("destroyInstance", () => {
    it("should allow creating a new instance after destroying", () => {
      const instance1 = SupplierService.getInstance();
      SupplierService.destroyInstance();
      
      const instance2 = SupplierService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });
});
