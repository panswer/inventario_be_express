const categoryController = require("../../src/controllers/category");

jest.mock("../../src/services/CategoryService");
jest.mock("../../src/services/LoggerService");

const CategoryService = require("../../src/services/CategoryService");
const LoggerService = require("../../src/services/LoggerService");

describe("CategoryController", () => {
  let mockReq;
  let mockRes;
  let mockCategoryService;
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

    mockCategoryService = {
      getCategories: jest.fn(),
      getCategoryById: jest.fn(),
      getCategoryByName: jest.fn(),
      createCategory: jest.fn(),
      updateCategoryById: jest.fn(),
      toggleCategory: jest.fn(),
    };

    mockLoggerService = {
      error: jest.fn(),
      warn: jest.fn(),
    };

    CategoryService.getInstance.mockReturnValue(mockCategoryService);
    LoggerService.getInstance.mockReturnValue(mockLoggerService);
  });

  describe("getCategories", () => {
    it("should return all categories", async () => {
      const mockCategories = [{ _id: "1", name: "Category 1" }];
      mockCategoryService.getCategories.mockResolvedValue(mockCategories);

      await categoryController.getCategories(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ categories: mockCategories });
    });

    it("should filter only enabled categories", async () => {
      mockReq.query = { onlyEnabled: "true" };
      mockCategoryService.getCategories.mockResolvedValue([]);

      await categoryController.getCategories(mockReq, mockRes);

      expect(mockCategoryService.getCategories).toHaveBeenCalledWith(true);
    });
  });

  describe("getCategoryById", () => {
    it("should return category if found", async () => {
      const mockCategory = { _id: "1", name: "Test Category" };
      mockReq.params = { categoryId: "1" };
      mockCategoryService.getCategoryById.mockResolvedValue(mockCategory);

      await categoryController.getCategoryById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ category: mockCategory });
    });

    it("should return 404 if category not found", async () => {
      mockReq.params = { categoryId: "nonexistent" };
      mockCategoryService.getCategoryById.mockResolvedValue(null);

      await categoryController.getCategoryById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Category not found" });
    });

    it("should return 500 on service error", async () => {
      mockReq.params = { categoryId: "1" };
      mockCategoryService.getCategoryById.mockRejectedValue(new Error("Error"));

      await categoryController.getCategoryById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("createCategory", () => {
    it("should create category successfully", async () => {
      const mockCategory = { _id: "1", name: "New Category" };
      mockReq.body = { name: "New Category", session: { _id: "user123" } };
      mockCategoryService.getCategoryByName.mockResolvedValue(null);
      mockCategoryService.createCategory.mockResolvedValue(mockCategory);

      await categoryController.createCategory(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ category: mockCategory });
    });

    it("should return 400 if duplicate name", async () => {
      mockReq.body = { name: "Existing Category", session: { _id: "user123" } };
      mockCategoryService.getCategoryByName.mockResolvedValue({ _id: "1", name: "Existing Category" });

      await categoryController.createCategory(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 4004 });
    });

    it("should return 400 on service error", async () => {
      mockReq.body = { name: "New Category", session: { _id: "user123" } };
      mockCategoryService.getCategoryByName.mockResolvedValue(null);
      mockCategoryService.createCategory.mockRejectedValue(new Error("Error"));

      await categoryController.createCategory(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 4001 });
    });
  });

  describe("updateCategoryById", () => {
    it("should update category successfully", async () => {
      const mockCategory = { _id: "1", name: "Updated Category" };
      mockReq.params = { categoryId: "1" };
      mockReq.body = { name: "Updated Category" };
      mockCategoryService.getCategoryById.mockResolvedValue({ _id: "1", name: "Old Category" });
      mockCategoryService.getCategoryByName.mockResolvedValue(null);
      mockCategoryService.updateCategoryById.mockResolvedValue(mockCategory);

      await categoryController.updateCategoryById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ category: mockCategory });
    });

    it("should return 404 if category not found", async () => {
      mockReq.params = { categoryId: "nonexistent" };
      mockReq.body = { name: "New Name" };
      mockCategoryService.getCategoryById.mockResolvedValue(null);

      await categoryController.updateCategoryById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 if duplicate name", async () => {
      mockReq.params = { categoryId: "1" };
      mockReq.body = { name: "Existing Name" };
      mockCategoryService.getCategoryById.mockResolvedValue({ _id: "1", name: "Old Name" });
      mockCategoryService.getCategoryByName.mockResolvedValue({ _id: "2", name: "Existing Name" });

      await categoryController.updateCategoryById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 4004 });
    });

    it("should return 500 on service error", async () => {
      mockReq.params = { categoryId: "1" };
      mockReq.body = { name: "New Name" };
      mockCategoryService.getCategoryById.mockResolvedValue({ _id: "1", name: "Old Name" });
      mockCategoryService.getCategoryByName.mockResolvedValue(null);
      mockCategoryService.updateCategoryById.mockRejectedValue(new Error("Error"));

      await categoryController.updateCategoryById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("toggleCategory", () => {
    it("should toggle category successfully", async () => {
      const mockCategory = { _id: "1", name: "Test", isEnabled: false };
      mockReq.params = { categoryId: "1" };
      mockCategoryService.getCategoryById.mockResolvedValue({ _id: "1", name: "Test", isEnabled: true });
      mockCategoryService.toggleCategory.mockResolvedValue(mockCategory);

      await categoryController.toggleCategory(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ category: mockCategory });
    });

    it("should return 404 if category not found", async () => {
      mockReq.params = { categoryId: "nonexistent" };
      mockCategoryService.getCategoryById.mockResolvedValue(null);

      await categoryController.toggleCategory(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should return 500 on service error", async () => {
      mockReq.params = { categoryId: "1" };
      mockCategoryService.getCategoryById.mockResolvedValue({ _id: "1", name: "Test" });
      mockCategoryService.toggleCategory.mockRejectedValue(new Error("Error"));

      await categoryController.toggleCategory(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
