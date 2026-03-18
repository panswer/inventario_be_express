const mongoose = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const createTestApp = require("../../src/testApp");
const Category = require("../../src/models/Category");

describe("Category Routes", () => {
  let app;
  let token;
  let userId;

  beforeAll(async () => {
    app = createTestApp();
    userId = new mongoose.Types.ObjectId();
    token = jwt.sign({ _id: userId }, process.env.SERVER_JWT_SESSION_SECRET);
  });

  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe("GET /api/category", () => {
    it("should return 403 without auth", async () => {
      const res = await request(app).get("/api/category");
      expect(res.status).toBe(403);
    });

    it("should return 200 with auth", async () => {
      const res = await request(app)
        .get("/api/category")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.categories).toBeDefined();
    });

    it("should return only enabled categories when filter enabled", async () => {
      await Category.create({ name: "Enabled Category", createdBy: userId, isEnabled: true });
      await Category.create({ name: "Disabled Category", createdBy: userId, isEnabled: false });

      const res = await request(app)
        .get("/api/category?onlyEnabled=true")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.categories).toHaveLength(1);
      expect(res.body.categories[0].name).toBe("Enabled Category");
    });
  });

  describe("POST /api/category", () => {
    it("should return 403 without auth", async () => {
      const res = await request(app)
        .post("/api/category")
        .send({ name: "Test Category" });

      expect(res.status).toBe(403);
    });

    it("should return 201 with valid data", async () => {
      const res = await request(app)
        .post("/api/category")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Test Category" });

      expect(res.status).toBe(201);
      expect(res.body.category).toBeDefined();
      expect(res.body.category.name).toBe("Test Category");
    });

    it("should return 400 with missing name", async () => {
      const res = await request(app)
        .post("/api/category")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it("should return 4004 for duplicate name", async () => {
      await Category.create({ name: "Existing Category", createdBy: userId });

      const res = await request(app)
        .post("/api/category")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Existing Category" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(4004);
    });
  });

  describe("GET /api/category/:categoryId", () => {
    it("should return 200 for existing category", async () => {
      const category = await Category.create({ name: "Test Category", createdBy: userId });

      const res = await request(app)
        .get(`/api/category/${category._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.category.name).toBe("Test Category");
    });

    it("should return 404 for non-existing category", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/category/${nonExistentId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/category/:categoryId", () => {
    it("should return 403 without auth", async () => {
      const res = await request(app)
        .put(`/api/category/${new mongoose.Types.ObjectId()}`)
        .send({ name: "Updated Category" });

      expect(res.status).toBe(403);
    });

    it("should return 200 with valid data", async () => {
      const category = await Category.create({ name: "Old Name", createdBy: userId });

      const res = await request(app)
        .put(`/api/category/${category._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "New Name" });

      expect(res.status).toBe(200);
      expect(res.body.category.name).toBe("New Name");
    });

    it("should return 404 for non-existing category", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/category/${nonExistentId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "New Name" });

      expect(res.status).toBe(404);
    });

    it("should return 4004 for duplicate name", async () => {
      const category = await Category.create({ name: "Category 1", createdBy: userId });
      await Category.create({ name: "Category 2", createdBy: userId });

      const res = await request(app)
        .put(`/api/category/${category._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Category 2" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(4004);
    });
  });

  describe("PATCH /api/category/:categoryId/toggle", () => {
    it("should return 403 without auth", async () => {
      const res = await request(app)
        .patch(`/api/category/${new mongoose.Types.ObjectId()}/toggle`);

      expect(res.status).toBe(403);
    });

    it("should toggle category enabled status", async () => {
      const category = await Category.create({ name: "Test Category", createdBy: userId, isEnabled: true });

      const res = await request(app)
        .patch(`/api/category/${category._id}/toggle`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.category.isEnabled).toBe(false);
    });

    it("should toggle back to enabled", async () => {
      const category = await Category.create({ name: "Test Category", createdBy: userId, isEnabled: false });

      const res = await request(app)
        .patch(`/api/category/${category._id}/toggle`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.category.isEnabled).toBe(true);
    });

    it("should return 404 for non-existing category", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .patch(`/api/category/${nonExistentId}/toggle`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
