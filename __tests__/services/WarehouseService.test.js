const mongoose = require("mongoose");
const WarehouseService = require("../../src/services/WarehouseService");
const Warehouse = require("../../src/models/Warehouse");
require("../../src/models/User");

describe("WarehouseService", () => {
  beforeEach(() => {
    WarehouseService.destroyInstance();
  });

  afterEach(async () => {
    await Warehouse.deleteMany({});
    WarehouseService.destroyInstance();
  });

  describe("getInstance", () => {
    it("should return the same instance (singleton)", () => {
      const instance1 = WarehouseService.getInstance();
      const instance2 = WarehouseService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("getWarehouses", () => {
    it("should return warehouses with pagination", async () => {
      const userId = new mongoose.Types.ObjectId();
      
      await Warehouse.create({ name: "Warehouse 1", address: "Address 1", createdBy: userId });
      await Warehouse.create({ name: "Warehouse 2", address: "Address 2", createdBy: userId });

      const service = WarehouseService.getInstance();
      const result = await service.getWarehouses(0, 10);

      expect(result).toHaveLength(2);
    });

    it("should exclude disabled warehouses", async () => {
      const userId = new mongoose.Types.ObjectId();
      
      await Warehouse.create({ name: "Active", address: "Address", createdBy: userId, isEnabled: true });
      await Warehouse.create({ name: "Disabled", address: "Address", createdBy: userId, isEnabled: false });

      const service = WarehouseService.getInstance();
      const result = await service.getWarehouses(0, 10);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Active");
    });

    it("should respect skip and limit", async () => {
      const userId = new mongoose.Types.ObjectId();
      
      for (let i = 0; i < 5; i++) {
        await Warehouse.create({ name: `Warehouse ${i}`, address: `Address ${i}`, createdBy: userId });
      }

      const service = WarehouseService.getInstance();
      const result = await service.getWarehouses(2, 2);

      expect(result).toHaveLength(2);
    });
  });

  describe("countWarehouses", () => {
    it("should return correct count", async () => {
      const userId = new mongoose.Types.ObjectId();
      
      await Warehouse.create({ name: "Warehouse 1", address: "Address", createdBy: userId });
      await Warehouse.create({ name: "Warehouse 2", address: "Address", createdBy: userId });

      const service = WarehouseService.getInstance();
      const result = await service.countWarehouses();

      expect(result).toBe(2);
    });

    it("should return 0 when no warehouses", async () => {
      const service = WarehouseService.getInstance();
      const result = await service.countWarehouses();

      expect(result).toBe(0);
    });
  });

  describe("getWarehouseById", () => {
    it("should return warehouse by id", async () => {
      const userId = new mongoose.Types.ObjectId();
      const warehouse = await Warehouse.create({ 
        name: "Test Warehouse", 
        address: "Test Address", 
        createdBy: userId 
      });

      const service = WarehouseService.getInstance();
      const result = await service.getWarehouseById(warehouse._id);

      expect(result).toBeTruthy();
      expect(result.name).toBe("Test Warehouse");
    });

    it("should return null if warehouse not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const service = WarehouseService.getInstance();
      const result = await service.getWarehouseById(nonExistentId);

      expect(result).toBeNull();
    });

    it("should return null for disabled warehouse", async () => {
      const userId = new mongoose.Types.ObjectId();
      const warehouse = await Warehouse.create({ 
        name: "Disabled Warehouse", 
        address: "Address", 
        createdBy: userId,
        isEnabled: false 
      });

      const service = WarehouseService.getInstance();
      const result = await service.getWarehouseById(warehouse._id);

      expect(result).toBeNull();
    });
  });

  describe("createWarehouse", () => {
    it("should create a new warehouse", async () => {
      const userId = new mongoose.Types.ObjectId();

      const service = WarehouseService.getInstance();
      const result = await service.createWarehouse(
        "New Warehouse",
        "New Address",
        userId
      );

      expect(result).toBeTruthy();
      expect(result.name).toBe("New Warehouse");
      expect(result.address).toBe("New Address");
      expect(result._id).toBeDefined();
    });
  });

  describe("updateWarehouse", () => {
    it("should update warehouse name", async () => {
      const userId = new mongoose.Types.ObjectId();
      const warehouse = await Warehouse.create({ 
        name: "Original Name", 
        address: "Address", 
        createdBy: userId 
      });

      const service = WarehouseService.getInstance();
      const result = await service.updateWarehouse(warehouse._id, { name: "Updated Name" });

      expect(result).toBeTruthy();
      expect(result.name).toBe("Updated Name");
    });

    it("should update warehouse address", async () => {
      const userId = new mongoose.Types.ObjectId();
      const warehouse = await Warehouse.create({ 
        name: "Name", 
        address: "Original Address", 
        createdBy: userId 
      });

      const service = WarehouseService.getInstance();
      const result = await service.updateWarehouse(warehouse._id, { address: "Updated Address" });

      expect(result).toBeTruthy();
      expect(result.address).toBe("Updated Address");
    });

    it("should return null for non-existent warehouse", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const service = WarehouseService.getInstance();
      const result = await service.updateWarehouse(nonExistentId, { name: "Name" });

      expect(result).toBeNull();
    });
  });

  describe("deleteWarehouse", () => {
    it("should soft delete warehouse", async () => {
      const userId = new mongoose.Types.ObjectId();
      const warehouse = await Warehouse.create({ 
        name: "To Delete", 
        address: "Address", 
        createdBy: userId 
      });

      const service = WarehouseService.getInstance();
      const result = await service.deleteWarehouse(warehouse._id);

      expect(result).toBeTruthy();
      expect(result.isEnabled).toBe(false);
    });

    it("should not return deleted warehouse in queries", async () => {
      const userId = new mongoose.Types.ObjectId();
      const warehouse = await Warehouse.create({ 
        name: "To Delete", 
        address: "Address", 
        createdBy: userId 
      });

      const service = WarehouseService.getInstance();
      await service.deleteWarehouse(warehouse._id);
      
      const found = await service.getWarehouseById(warehouse._id);
      expect(found).toBeNull();
    });

    it("should return null for non-existent warehouse", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const service = WarehouseService.getInstance();
      const result = await service.deleteWarehouse(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe("warehouseExists", () => {
    it("should return true for existing warehouse", async () => {
      const userId = new mongoose.Types.ObjectId();
      const warehouse = await Warehouse.create({ 
        name: "Existing", 
        address: "Address", 
        createdBy: userId 
      });

      const service = WarehouseService.getInstance();
      const result = await service.warehouseExists(warehouse._id);

      expect(result).toBe(true);
    });

    it("should return false for non-existing warehouse", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const service = WarehouseService.getInstance();
      const result = await service.warehouseExists(nonExistentId);

      expect(result).toBe(false);
    });

    it("should return false for disabled warehouse", async () => {
      const userId = new mongoose.Types.ObjectId();
      const warehouse = await Warehouse.create({ 
        name: "Disabled", 
        address: "Address", 
        createdBy: userId,
        isEnabled: false 
      });

      const service = WarehouseService.getInstance();
      const result = await service.warehouseExists(warehouse._id);

      expect(result).toBe(false);
    });
  });

  describe("destroyInstance", () => {
    it("should allow creating a new instance after destroying", () => {
      const instance1 = WarehouseService.getInstance();
      WarehouseService.destroyInstance();
      
      const instance2 = WarehouseService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });
});
