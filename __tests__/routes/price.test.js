const mongoose = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const createTestApp = require("../../src/testApp");
const Price = require("../../src/models/Price");

describe("Price Routes", () => {
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

  describe("GET /api/price/coin", () => {
    it("should return 200 with coins", async () => {
      const res = await request(app)
        .get("/api/price/coin")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.coins).toBeDefined();
    });
  });

  describe("GET /api/price/product/:productId", () => {
    it("should return 403 without auth", async () => {
      const productId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/price/product/${productId}`);

      expect(res.status).toBe(403);
    });

    it("should return 200 with auth", async () => {
      const productId = new mongoose.Types.ObjectId();
      await Price.create({
        amount: 100,
        coin: "$",
        productId,
        createdBy: userId,
      });

      const res = await request(app)
        .get(`/api/price/product/${productId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.price).toBeDefined();
    });

    it("should return 404 when price not found", async () => {
      const productId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/price/product/${productId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/price/:priceId/:coin", () => {
    it("should return 403 without auth", async () => {
      const priceId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/price/${priceId}/$`)
        .send({ amount: 50 });

      expect(res.status).toBe(403);
    });

    it("should return 202 with valid data", async () => {
      const productId = new mongoose.Types.ObjectId();
      const price = await Price.create({
        amount: 100,
        coin: "$",
        productId,
        createdBy: userId,
      });

      const res = await request(app)
        .put(`/api/price/${price._id}/$`)
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 50 });

      expect(res.status).toBe(202);
    });

    it("should return 404 when price not found for invalid coin", async () => {
      const productId = new mongoose.Types.ObjectId();
      const price = await Price.create({
        amount: 100,
        coin: "$",
        productId,
        createdBy: userId,
      });

      const res = await request(app)
        .put(`/api/price/${price._id}/INVALID`)
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 50 });

      expect(res.status).toBe(404);
    });

    it("should return 404 when price not found", async () => {
      const priceId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/price/${priceId}/$`)
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 50 });

      expect(res.status).toBe(404);
    });
  });
});
