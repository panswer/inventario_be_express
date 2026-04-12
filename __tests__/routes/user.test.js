const mongoose = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const createTestApp = require("../../src/testApp");
const User = require("../../src/models/User");
const Warehouse = require("../../src/models/Warehouse");

describe("User Routes", () => {
  let app;
  let adminToken;
  let userToken;
  let adminUserId;
  let regularUserId;

  beforeAll(async () => {
    app = createTestApp();
    adminUserId = new mongoose.Types.ObjectId();
    regularUserId = new mongoose.Types.ObjectId();
    adminToken = jwt.sign({ _id: adminUserId, role: "admin" }, process.env.SERVER_JWT_SESSION_SECRET);
    userToken = jwt.sign({ _id: regularUserId, role: "user" }, process.env.SERVER_JWT_SESSION_SECRET);
  });

  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe("GET /api/users", () => {
    it("should return 403 without auth", async () => {
      const res = await request(app).get("/api/users");
      expect(res.status).toBe(403);
    });

    it("should return 403 with non-admin user", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it("should return 200 with admin token", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.users).toBeDefined();
    });
  });

  describe("PATCH /api/users/:id/role", () => {
    it("should return 403 without auth", async () => {
      const res = await request(app)
        .patch("/api/users/user123/role")
        .send({ role: "manager" });

      expect(res.status).toBe(403);
    });

    it("should return 404 for nonexistent user", async () => {
      const res = await request(app)
        .patch("/api/users/nonexistent/role")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "manager" });

      expect(res.status).toBe(404);
    });

    it("should return 400 for invalid role", async () => {
      const user = await User.create({
        username: "test@test.com",
        password: "hashed_password",
      });

      const res = await request(app)
        .patch(`/api/users/${user._id}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "invalid" });

      expect(res.status).toBe(400);
    });

    it("should update user role successfully", async () => {
      const user = await User.create({
        username: "test@test.com",
        password: "hashed_password",
      });

      const res = await request(app)
        .patch(`/api/users/${user._id}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "manager" });

      console.log('Response:', res.status, res.body);
      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe("manager");
    });
  });

  describe("PATCH /api/users/:id/warehouse", () => {
    it("should return 403 without auth", async () => {
      const res = await request(app)
        .patch("/api/users/user123/warehouse")
        .send({ warehouseId: new mongoose.Types.ObjectId().toString() });

      expect(res.status).toBe(403);
    });

    it("should return 403 with non-admin user", async () => {
      const res = await request(app)
        .patch("/api/users/user123/warehouse")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ warehouseId: new mongoose.Types.ObjectId().toString() });

      expect(res.status).toBe(403);
    });

    it("should return 400 for invalid warehouseId", async () => {
      const user = await User.create({
        username: "test@test.com",
        password: "hashed_password",
      });

      const res = await request(app)
        .patch(`/api/users/${user._id}/warehouse`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ warehouseId: "invalid_id" });

      expect(res.status).toBe(400);
    });

    it("should return 404 for nonexistent user", async () => {
      const res = await request(app)
        .patch("/api/users/nonexistent/warehouse")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ warehouseId: new mongoose.Types.ObjectId().toString() });

      expect(res.status).toBe(404);
    });

    it("should assign warehouse to user successfully", async () => {
      const user = await User.create({
        username: "test@test.com",
        password: "hashed_password",
      });

      const warehouse = await Warehouse.create({
        name: "Test Warehouse",
        address: "Test Address",
        createdBy: adminUserId,
      });

      const res = await request(app)
        .patch(`/api/users/${user._id}/warehouse`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ warehouseId: warehouse._id.toString() });

      expect(res.status).toBe(200);
      expect(res.body.user.warehouseId).toBe(warehouse._id.toString());
    });
  });
});