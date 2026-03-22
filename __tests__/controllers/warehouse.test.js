const warehouseController = require("../../src/controllers/warehouse");
jest.mock("../../src/services/WarehouseService");

const WarehouseService = require("../../src/services/WarehouseService");

describe("WarehouseController", () => {
  let mockReq;
  let mockRes;
  let mockWarehouseService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      query: {},
      body: {},
      params: {},
      requestId: "test-request-id",
      userIp: "127.0.0.1",
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockWarehouseService = {
      getWarehouses: jest.fn(),
      getWarehouseById: jest.fn(),
      createWarehouse: jest.fn(),
      updateWarehouse: jest.fn(),
      deleteWarehouse: jest.fn(),
      countWarehouses: jest.fn(),
    };

    WarehouseService.getInstance.mockReturnValue(mockWarehouseService);
  });

  describe("getWarehouses", () => {
    it("should return warehouses with pagination", async () => {
      const mockWarehouses = [{ _id: "1", name: "Warehouse 1" }];
      mockReq.query = { page: "1", limit: "10" };
      mockWarehouseService.getWarehouses.mockResolvedValue(mockWarehouses);
      mockWarehouseService.countWarehouses.mockResolvedValue(1);

      await warehouseController.getWarehouses(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        warehouses: mockWarehouses,
        total: 1,
      });
    });

    it("should use default pagination values", async () => {
      mockReq.query = {};
      mockWarehouseService.getWarehouses.mockResolvedValue([]);
      mockWarehouseService.countWarehouses.mockResolvedValue(0);

      await warehouseController.getWarehouses(mockReq, mockRes);

      expect(mockWarehouseService.getWarehouses).toHaveBeenCalledWith(0, 10);
    });

    it("should return 500 on error", async () => {
      mockWarehouseService.getWarehouses.mockRejectedValue(new Error("DB Error"));

      await warehouseController.getWarehouses(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Internal error" });
    });
  });

  describe("getWarehouseById", () => {
    it("should return warehouse if found", async () => {
      const mockWarehouse = { _id: "1", name: "Test Warehouse" };
      mockReq.params.warehouseId = "1";
      mockWarehouseService.getWarehouseById.mockResolvedValue(mockWarehouse);

      await warehouseController.getWarehouseById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ warehouse: mockWarehouse });
    });

    it("should return 404 if warehouse not found", async () => {
      mockReq.params.warehouseId = "nonexistent";
      mockWarehouseService.getWarehouseById.mockResolvedValue(null);

      await warehouseController.getWarehouseById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 4000 });
    });
  });

  describe("createWarehouse", () => {
    it("should create warehouse successfully", async () => {
      const mockWarehouse = { _id: "1", name: "New Warehouse", address: "New Address" };
      mockReq.body = { 
        name: "New Warehouse", 
        address: "New Address",
        session: { _id: "user123" }
      };
      mockWarehouseService.createWarehouse.mockResolvedValue(mockWarehouse);

      await warehouseController.createWarehouse(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ warehouse: mockWarehouse });
    });

    it("should return 400 on creation error", async () => {
      mockReq.body = { name: "Test", session: { _id: "user123" } };
      mockWarehouseService.createWarehouse.mockRejectedValue(new Error("Error"));

      await warehouseController.createWarehouse(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 4000 });
    });
  });

  describe("updateWarehouse", () => {
    it("should update warehouse successfully", async () => {
      const mockWarehouse = { _id: "1", name: "Updated Warehouse" };
      mockReq.params.warehouseId = "1";
      mockReq.body = { name: "Updated Warehouse" };
      mockWarehouseService.updateWarehouse.mockResolvedValue(mockWarehouse);

      await warehouseController.updateWarehouse(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ warehouse: mockWarehouse });
    });

    it("should return 404 if warehouse not found", async () => {
      mockReq.params.warehouseId = "nonexistent";
      mockWarehouseService.updateWarehouse.mockResolvedValue(null);

      await warehouseController.updateWarehouse(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 4000 });
    });

    it("should return 400 on update error", async () => {
      mockReq.params.warehouseId = "1";
      mockReq.body = { name: "Updated" };
      mockWarehouseService.updateWarehouse.mockRejectedValue(new Error("Error"));

      await warehouseController.updateWarehouse(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 4000 });
    });
  });

  describe("deleteWarehouse", () => {
    it("should delete warehouse successfully", async () => {
      const mockWarehouse = { _id: "1", name: "Deleted Warehouse", isEnabled: false };
      mockReq.params.warehouseId = "1";
      mockWarehouseService.deleteWarehouse.mockResolvedValue(mockWarehouse);

      await warehouseController.deleteWarehouse(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ warehouse: mockWarehouse });
    });

    it("should return 404 if warehouse not found", async () => {
      mockReq.params.warehouseId = "nonexistent";
      mockWarehouseService.deleteWarehouse.mockResolvedValue(null);

      await warehouseController.deleteWarehouse(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 4000 });
    });

    it("should return 500 on delete error", async () => {
      mockReq.params.warehouseId = "1";
      mockWarehouseService.deleteWarehouse.mockRejectedValue(new Error("Error"));

      await warehouseController.deleteWarehouse(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Internal error" });
    });
  });
});
