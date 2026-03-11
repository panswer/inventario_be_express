const mongoose = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const createTestApp = require("../../src/testApp");
const Bill = require("../../src/models/Bill");

describe("Bill Routes", () => {
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

  describe("GET /api/bill", () => {
    it("should return 403 without auth", async () => {
      const res = await request(app).get("/api/bill");
      expect(res.status).toBe(403);
    });

    it("should return 200 with auth", async () => {
      const res = await request(app)
        .get("/api/bill")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.bills).toBeDefined();
      expect(res.body.total).toBeDefined();
    });
  });

  describe("POST /api/bill", () => {
    it("should return 403 without auth", async () => {
      const res = await request(app)
        .post("/api/bill")
        .send({ sellers: [] });

      expect(res.status).toBe(403);
    });

    it("should return 201 with valid data", async () => {
      const productId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post("/api/bill")
        .set("Authorization", `Bearer ${token}`)
        .send({
          sellers: [
            {
              productId: productId.toString(),
              count: 2,
              price: 50,
              coin: "$",
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
    });

    it("should return 400 with missing sellers", async () => {
      const res = await request(app)
        .post("/api/bill")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/bill/detail/:billId", () => {
    it("should return 403 without auth", async () => {
      const billId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/bill/detail/${billId}`);

      expect(res.status).toBe(403);
    });

    it("should return 200 with auth", async () => {
      const bill = await Bill.create({ userId });

      const res = await request(app)
        .get(`/api/bill/detail/${bill._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.billDetail).toBeDefined();
    });
  });
});
