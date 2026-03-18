const supplierController = require("../../src/controllers/supplier");

jest.mock("../../src/services/SupplierService");
jest.mock("../../src/services/LoggerService");

const SupplierService = require("../../src/services/SupplierService");
const LoggerService = require("../../src/services/LoggerService");

describe("SupplierController", () => {
  let mockReq;
  let mockRes;
  let mockSupplierService;
  let mockLoggerService;

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

    mockSupplierService = {
      getSuppliers: jest.fn(),
      getSupplierById: jest.fn(),
      getSupplierByRif: jest.fn(),
      createSupplier: jest.fn(),
      updateSupplierById: jest.fn(),
      toggleSupplier: jest.fn(),
    };

    mockLoggerService = {
      error: jest.fn(),
      warn: jest.fn(),
    };

    SupplierService.getInstance.mockReturnValue(mockSupplierService);
    LoggerService.getInstance.mockReturnValue(mockLoggerService);
  });

  describe("getSuppliers", () => {
    it("should return all suppliers", async () => {
      const mockSuppliers = [{ _id: "1", name: "Supplier 1" }];
      mockSupplierService.getSuppliers.mockResolvedValue(mockSuppliers);

      await supplierController.getSuppliers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ suppliers: mockSuppliers });
    });

    it("should filter only enabled suppliers", async () => {
      mockReq.query = { onlyEnabled: "true" };
      mockSupplierService.getSuppliers.mockResolvedValue([]);

      await supplierController.getSuppliers(mockReq, mockRes);

      expect(mockSupplierService.getSuppliers).toHaveBeenCalledWith(true);
    });
  });

  describe("getSupplierById", () => {
    it("should return supplier if found", async () => {
      const mockSupplier = { _id: "1", name: "Test Supplier" };
      mockReq.params = { supplierId: "1" };
      mockSupplierService.getSupplierById.mockResolvedValue(mockSupplier);

      await supplierController.getSupplierById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ supplier: mockSupplier });
    });

    it("should return 404 if supplier not found", async () => {
      mockReq.params = { supplierId: "nonexistent" };
      mockSupplierService.getSupplierById.mockResolvedValue(null);

      await supplierController.getSupplierById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Supplier not found" });
    });

    it("should return 500 on service error", async () => {
      mockReq.params = { supplierId: "1" };
      mockSupplierService.getSupplierById.mockRejectedValue(new Error("Error"));

      await supplierController.getSupplierById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("createSupplier", () => {
    it("should create supplier successfully", async () => {
      const mockSupplier = { _id: "1", name: "New Supplier", rif: "J-12345678-9" };
      mockReq.body = { name: "New Supplier", rif: "J-12345678-9", session: { _id: "user123" } };
      mockSupplierService.getSupplierByRif.mockResolvedValue(null);
      mockSupplierService.createSupplier.mockResolvedValue(mockSupplier);

      await supplierController.createSupplier(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ supplier: mockSupplier });
    });

    it("should return 400 if duplicate rif", async () => {
      mockReq.body = { name: "Existing Supplier", rif: "J-12345678-9", session: { _id: "user123" } };
      mockSupplierService.getSupplierByRif.mockResolvedValue({ _id: "1", rif: "J-12345678-9" });

      await supplierController.createSupplier(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 4004 });
    });

    it("should return 400 on service error", async () => {
      mockReq.body = { name: "New Supplier", rif: "J-12345678-9", session: { _id: "user123" } };
      mockSupplierService.getSupplierByRif.mockResolvedValue(null);
      mockSupplierService.createSupplier.mockRejectedValue(new Error("Error"));

      await supplierController.createSupplier(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 4001 });
    });
  });

  describe("updateSupplierById", () => {
    it("should update supplier successfully", async () => {
      const mockSupplier = { _id: "1", name: "Updated Supplier" };
      mockReq.params = { supplierId: "1" };
      mockReq.body = { name: "Updated Supplier" };
      mockSupplierService.getSupplierById.mockResolvedValue({ _id: "1", name: "Old Supplier" });
      mockSupplierService.getSupplierByRif.mockResolvedValue(null);
      mockSupplierService.updateSupplierById.mockResolvedValue(mockSupplier);

      await supplierController.updateSupplierById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ supplier: mockSupplier });
    });

    it("should return 404 if supplier not found", async () => {
      mockReq.params = { supplierId: "nonexistent" };
      mockReq.body = { name: "New Name" };
      mockSupplierService.getSupplierById.mockResolvedValue(null);

      await supplierController.updateSupplierById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 if duplicate rif", async () => {
      mockReq.params = { supplierId: "1" };
      mockReq.body = { rif: "J-99999999-9" };
      mockSupplierService.getSupplierById.mockResolvedValue({ _id: "1", rif: "J-11111111-1" });
      mockSupplierService.getSupplierByRif.mockResolvedValue({ _id: "2", rif: "J-99999999-9" });

      await supplierController.updateSupplierById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 4004 });
    });

    it("should return 500 on service error", async () => {
      mockReq.params = { supplierId: "1" };
      mockReq.body = { name: "New Name" };
      mockSupplierService.getSupplierById.mockResolvedValue({ _id: "1", name: "Old Name" });
      mockSupplierService.getSupplierByRif.mockResolvedValue(null);
      mockSupplierService.updateSupplierById.mockRejectedValue(new Error("Error"));

      await supplierController.updateSupplierById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("toggleSupplier", () => {
    it("should toggle supplier successfully", async () => {
      const mockSupplier = { _id: "1", name: "Test", isEnabled: false };
      mockReq.params = { supplierId: "1" };
      mockSupplierService.getSupplierById.mockResolvedValue({ _id: "1", name: "Test", isEnabled: true });
      mockSupplierService.toggleSupplier.mockResolvedValue(mockSupplier);

      await supplierController.toggleSupplier(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ supplier: mockSupplier });
    });

    it("should return 404 if supplier not found", async () => {
      mockReq.params = { supplierId: "nonexistent" };
      mockSupplierService.getSupplierById.mockResolvedValue(null);

      await supplierController.toggleSupplier(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should return 500 on service error", async () => {
      mockReq.params = { supplierId: "1" };
      mockSupplierService.getSupplierById.mockResolvedValue({ _id: "1", name: "Test" });
      mockSupplierService.toggleSupplier.mockRejectedValue(new Error("Error"));

      await supplierController.toggleSupplier(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
