const mongoose = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const createTestApp = require("../../src/testApp");
const Supplier = require("../../src/models/Supplier");

describe("Supplier Routes", () => {
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

  describe("GET /api/supplier", () => {
    it("should return 403 without auth", async () => {
      const res = await request(app).get("/api/supplier");
      expect(res.status).toBe(403);
    });

    it("should return 200 with auth", async () => {
      const res = await request(app)
        .get("/api/supplier")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.suppliers).toBeDefined();
    });

    it("should return only enabled suppliers when filter enabled", async () => {
      await Supplier.create({ name: "Enabled Supplier", rif: "J-11111111-1", createdBy: userId, isEnabled: true });
      await Supplier.create({ name: "Disabled Supplier", rif: "J-22222222-2", createdBy: userId, isEnabled: false });

      const res = await request(app)
        .get("/api/supplier?onlyEnabled=true")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.suppliers).toHaveLength(1);
      expect(res.body.suppliers[0].name).toBe("Enabled Supplier");
    });
  });

  describe("POST /api/supplier", () => {
    it("should return 403 without auth", async () => {
      const res = await request(app)
        .post("/api/supplier")
        .send({ name: "Test Supplier", rif: "J-12345678-9" });

      expect(res.status).toBe(403);
    });

    it("should return 201 with valid data", async () => {
      const res = await request(app)
        .post("/api/supplier")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Test Supplier", rif: "J-12345678-9" });

      expect(res.status).toBe(201);
      expect(res.body.supplier).toBeDefined();
      expect(res.body.supplier.name).toBe("Test Supplier");
      expect(res.body.supplier.rif).toBe("J-12345678-9");
    });

    it("should return 201 with optional fields", async () => {
      const res = await request(app)
        .post("/api/supplier")
        .set("Authorization", `Bearer ${token}`)
        .send({ 
          name: "Test Supplier", 
          rif: "J-12345678-9",
          phone: "04141234567",
          address: "Test Address",
          contactPerson: "John Doe"
        });

      expect(res.status).toBe(201);
      expect(res.body.supplier.phone).toBe("04141234567");
      expect(res.body.supplier.address).toBe("Test Address");
      expect(res.body.supplier.contactPerson).toBe("John Doe");
    });

    it("should return 400 with missing name", async () => {
      const res = await request(app)
        .post("/api/supplier")
        .set("Authorization", `Bearer ${token}`)
        .send({ rif: "J-12345678-9" });

      expect(res.status).toBe(400);
    });

    it("should return 400 with missing rif", async () => {
      const res = await request(app)
        .post("/api/supplier")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Test Supplier" });

      expect(res.status).toBe(400);
    });

    it("should return 4004 for duplicate rif", async () => {
      await Supplier.create({ name: "Existing Supplier", rif: "J-12345678-9", createdBy: userId });

      const res = await request(app)
        .post("/api/supplier")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "New Supplier", rif: "J-12345678-9" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(4004);
    });
  });

  describe("GET /api/supplier/:supplierId", () => {
    it("should return 200 for existing supplier", async () => {
      const supplier = await Supplier.create({ name: "Test Supplier", rif: "J-12345678-9", createdBy: userId });

      const res = await request(app)
        .get(`/api/supplier/${supplier._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.supplier.name).toBe("Test Supplier");
    });

    it("should return 404 for non-existing supplier", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/supplier/${nonExistentId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/supplier/:supplierId", () => {
    it("should return 403 without auth", async () => {
      const res = await request(app)
        .put(`/api/supplier/${new mongoose.Types.ObjectId()}`)
        .send({ name: "Updated Supplier" });

      expect(res.status).toBe(403);
    });

    it("should return 200 with valid data", async () => {
      const supplier = await Supplier.create({ name: "Old Name", rif: "J-12345678-9", createdBy: userId });

      const res = await request(app)
        .put(`/api/supplier/${supplier._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "New Name" });

      expect(res.status).toBe(200);
      expect(res.body.supplier.name).toBe("New Name");
    });

    it("should return 200 with multiple fields", async () => {
      const supplier = await Supplier.create({ name: "Old Name", rif: "J-12345678-9", createdBy: userId });

      const res = await request(app)
        .put(`/api/supplier/${supplier._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ 
          name: "New Name", 
          phone: "04141234567",
          address: "New Address"
        });

      expect(res.status).toBe(200);
      expect(res.body.supplier.name).toBe("New Name");
      expect(res.body.supplier.phone).toBe("04141234567");
      expect(res.body.supplier.address).toBe("New Address");
    });

    it("should return 404 for non-existing supplier", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/supplier/${nonExistentId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "New Name" });

      expect(res.status).toBe(404);
    });

    it("should return 4004 for duplicate rif", async () => {
      const supplier = await Supplier.create({ name: "Supplier 1", rif: "J-11111111-1", createdBy: userId });
      await Supplier.create({ name: "Supplier 2", rif: "J-22222222-2", createdBy: userId });

      const res = await request(app)
        .put(`/api/supplier/${supplier._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rif: "J-22222222-2" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(4004);
    });
  });

  describe("PATCH /api/supplier/:supplierId/toggle", () => {
    it("should return 403 without auth", async () => {
      const res = await request(app)
        .patch(`/api/supplier/${new mongoose.Types.ObjectId()}/toggle`);

      expect(res.status).toBe(403);
    });

    it("should toggle supplier enabled status", async () => {
      const supplier = await Supplier.create({ name: "Test Supplier", rif: "J-12345678-9", createdBy: userId, isEnabled: true });

      const res = await request(app)
        .patch(`/api/supplier/${supplier._id}/toggle`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.supplier.isEnabled).toBe(false);
    });

    it("should toggle back to enabled", async () => {
      const supplier = await Supplier.create({ name: "Test Supplier", rif: "J-12345678-9", createdBy: userId, isEnabled: false });

      const res = await request(app)
        .patch(`/api/supplier/${supplier._id}/toggle`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.supplier.isEnabled).toBe(true);
    });

    it("should return 404 for non-existing supplier", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .patch(`/api/supplier/${nonExistentId}/toggle`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
