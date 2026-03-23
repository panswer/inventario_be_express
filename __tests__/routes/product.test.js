const mongoose = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const createTestApp = require("../../src/testApp");
const Product = require("../../src/models/Product");

describe("Product Routes", () => {
  let app;
  let token;
  let userId;

  beforeAll(async () => {
    app = createTestApp();
    userId = new mongoose.Types.ObjectId();
    token = jwt.sign({ _id: userId, role: "admin" }, process.env.SERVER_JWT_SESSION_SECRET);
  });

  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe("GET /api/product", () => {
    it("should return 403 without auth", async () => {
      const res = await request(app).get("/api/product");
      expect(res.status).toBe(403);
    });

    it("should return 200 with auth", async () => {
      const res = await request(app)
        .get("/api/product")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.products).toBeDefined();
      expect(res.body.total).toBeDefined();
    });
  });

  describe("POST /api/product", () => {
    it("should return 403 without auth", async () => {
      const res = await request(app)
        .post("/api/product")
        .send({ name: "Test Product", amount: 100, coin: "$" });

      expect(res.status).toBe(403);
    });

    it("should return 201 with valid data", async () => {
      const res = await request(app)
        .post("/api/product")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Test Product", amount: 100, coin: "$" });

      expect(res.status).toBe(201);
      expect(res.body.product).toBeDefined();
      expect(res.body.price).toBeDefined();
    });

    it("should return 400 with missing fields", async () => {
      const res = await request(app)
        .post("/api/product")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Test Product" });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/product/:productId", () => {
    it("should return 200 for existing product", async () => {
      const product = await Product.create({
        name: "Test Product",
        createdBy: userId,
      });

      const res = await request(app)
        .get(`/api/product/${product._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.product).toBeDefined();
    });

    it("should return 200 even if not found (current behavior)", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/product/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });

  describe("PUT /api/product/:productId", () => {
    it("should return 200 with valid data", async () => {
      const product = await Product.create({
        name: "Test Product",
        createdBy: userId,
      });

      const res = await request(app)
        .put(`/api/product/${product._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated Product" });

      expect(res.status).toBe(200);
    });

    it("should return 400 with invalid name", async () => {
      const product = await Product.create({
        name: "Test Product",
        createdBy: userId,
      });

      const res = await request(app)
        .put(`/api/product/${product._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "ab" });

      expect(res.status).toBe(400);
    });

    it("should return 404 for non-existent product", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/product/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated Product" });

      expect(res.status).toBe(404);
    });
  });
});
