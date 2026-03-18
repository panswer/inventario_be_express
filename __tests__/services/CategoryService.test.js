const mongoose = require("mongoose");
const CategoryService = require("../../src/services/CategoryService");
const Category = require("../../src/models/Category");

describe("CategoryService", () => {
  beforeEach(() => {
    CategoryService.destroyInstance();
  });

  afterEach(async () => {
    CategoryService.destroyInstance();
  });

  describe("getInstance", () => {
    it("should return the same instance (singleton)", () => {
      const instance1 = CategoryService.getInstance();
      const instance2 = CategoryService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("getCategories", () => {
    it("should return all categories when no filter", async () => {
      const userId = new mongoose.Types.ObjectId();
      
      await Category.create({ name: "Category 1", createdBy: userId, isEnabled: true });
      await Category.create({ name: "Category 2", createdBy: userId, isEnabled: false });

      const service = CategoryService.getInstance();
      const result = await service.getCategories();

      expect(result).toHaveLength(2);
    });

    it("should return only enabled categories when filter enabled", async () => {
      const userId = new mongoose.Types.ObjectId();
      
      await Category.create({ name: "Category 1", createdBy: userId, isEnabled: true });
      await Category.create({ name: "Category 2", createdBy: userId, isEnabled: false });

      const service = CategoryService.getInstance();
      const result = await service.getCategories(true);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Category 1");
    });

    it("should return empty array when no categories", async () => {
      const service = CategoryService.getInstance();
      const result = await service.getCategories();

      expect(result).toHaveLength(0);
    });
  });

  describe("getCategoryById", () => {
    it("should return category by id", async () => {
      const userId = new mongoose.Types.ObjectId();
      const category = await Category.create({ name: "Test Category", createdBy: userId });

      const service = CategoryService.getInstance();
      const result = await service.getCategoryById(category._id);

      expect(result).toBeTruthy();
      expect(result.name).toBe("Test Category");
    });

    it("should return null if category not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const service = CategoryService.getInstance();
      const result = await service.getCategoryById(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe("getCategoryByName", () => {
    it("should return category by exact name", async () => {
      const userId = new mongoose.Types.ObjectId();
      await Category.create({ name: "Electronics", createdBy: userId });

      const service = CategoryService.getInstance();
      const result = await service.getCategoryByName("Electronics");

      expect(result).toBeTruthy();
      expect(result.name).toBe("Electronics");
    });

    it("should be case-insensitive", async () => {
      const userId = new mongoose.Types.ObjectId();
      await Category.create({ name: "Electronics", createdBy: userId });

      const service = CategoryService.getInstance();
      const result = await service.getCategoryByName("ELECTRONICS");

      expect(result).toBeTruthy();
      expect(result.name).toBe("Electronics");
    });

    it("should return null if category not found", async () => {
      const service = CategoryService.getInstance();
      const result = await service.getCategoryByName("NonExistent");

      expect(result).toBeNull();
    });
  });

  describe("createCategory", () => {
    it("should create a new category", async () => {
      const userId = new mongoose.Types.ObjectId();
      const categoryData = { name: "New Category", createdBy: userId };

      const service = CategoryService.getInstance();
      const result = await service.createCategory(categoryData);

      expect(result).toBeTruthy();
      expect(result.name).toBe("New Category");
      expect(result.isEnabled).toBe(true);
      expect(result._id).toBeDefined();
    });
  });

  describe("updateCategoryById", () => {
    it("should update category name", async () => {
      const userId = new mongoose.Types.ObjectId();
      const category = await Category.create({ name: "Old Name", createdBy: userId });

      const service = CategoryService.getInstance();
      const result = await service.updateCategoryById(category._id, { name: "New Name" });

      expect(result).toBeTruthy();
      expect(result.name).toBe("New Name");
    });

    it("should return null if category not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const service = CategoryService.getInstance();
      const result = await service.updateCategoryById(nonExistentId, { name: "New Name" });

      expect(result).toBeNull();
    });
  });

  describe("toggleCategory", () => {
    it("should disable enabled category", async () => {
      const userId = new mongoose.Types.ObjectId();
      const category = await Category.create({ name: "Test Category", createdBy: userId, isEnabled: true });

      const service = CategoryService.getInstance();
      const result = await service.toggleCategory(category._id);

      expect(result).toBeTruthy();
      expect(result.isEnabled).toBe(false);
    });

    it("should enable disabled category", async () => {
      const userId = new mongoose.Types.ObjectId();
      const category = await Category.create({ name: "Test Category", createdBy: userId, isEnabled: false });

      const service = CategoryService.getInstance();
      const result = await service.toggleCategory(category._id);

      expect(result).toBeTruthy();
      expect(result.isEnabled).toBe(true);
    });

    it("should return null if category not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const service = CategoryService.getInstance();
      const result = await service.toggleCategory(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe("getCategoriesByIds", () => {
    it("should return categories by IDs", async () => {
      const userId = new mongoose.Types.ObjectId();
      const cat1 = await Category.create({ name: "Category 1", createdBy: userId });
      const cat2 = await Category.create({ name: "Category 2", createdBy: userId });

      const service = CategoryService.getInstance();
      const result = await service.getCategoriesByIds([cat1._id.toString(), cat2._id.toString()]);

      expect(result).toHaveLength(2);
    });

    it("should return empty array when no matches", async () => {
      const service = CategoryService.getInstance();
      const result = await service.getCategoriesByIds([new mongoose.Types.ObjectId().toString()]);

      expect(result).toHaveLength(0);
    });
  });

  describe("destroyInstance", () => {
    it("should allow creating a new instance after destroying", () => {
      const instance1 = CategoryService.getInstance();
      CategoryService.destroyInstance();
      
      const instance2 = CategoryService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });
});
