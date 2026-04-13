const mongoose = require("mongoose");
const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../../src/services/EmailService");

const createTestApp = require("../../src/testApp");
const User = require("../../src/models/User");
const EmailService = require("../../src/services/EmailService");

describe("Authentication Routes", () => {
  let app;
  let token;
  let mockEmailService;

  beforeAll(async () => {
    app = createTestApp();
    token = jwt.sign({ _id: "testuser123", sessionId: "test-session-123" }, process.env.SERVER_JWT_SESSION_SECRET);

    mockEmailService = {
      sendResetPasswordEmailFlow: jest.fn().mockResolvedValue(true),
    };
    EmailService.getInstance.mockReturnValue(mockEmailService);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    mockEmailService.sendResetPasswordEmailFlow.mockResolvedValue(true);

    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe("POST /api/auth/sign-in", () => {
    it("should return 201 with token for valid credentials", async () => {
      const password = "password123";
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        username: "test@test.com",
        password: hashedPassword,
      });

      const res = await request(app)
        .post("/api/auth/sign-in")
        .send({ email: "test@test.com", password });

      expect(res.status).toBe(201);
      expect(res.body.authorization).toBeDefined();
    });

    it("should return 403 for invalid credentials", async () => {
      const password = "password123";
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        username: "test@test.com",
        password: hashedPassword,
      });

      const res = await request(app)
        .post("/api/auth/sign-in")
        .send({ email: "test@test.com", password: "wrongpassword" });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe(1001);
    });

    it("should return 403 for non-existent user", async () => {
      const res = await request(app)
        .post("/api/auth/sign-in")
        .send({ email: "nonexistent@test.com", password: "password123" });

      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/auth/sign-up", () => {
    it("should return 201 for valid data", async () => {
      const res = await request(app)
        .post("/api/auth/sign-up")
        .send({ email: "newuser@test.com", password: "password123" });

      expect(res.status).toBe(201);
      expect(res.body.username).toBe("newuser@test.com");
    });

    it("should return 400 for duplicate email", async () => {
      await User.create({
        username: "test@test.com",
        password: "hashed_password",
      });

      const res = await request(app)
        .post("/api/auth/sign-up")
        .send({ email: "test@test.com", password: "password123" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(1000);
    });

    it("should return 400 for missing fields", async () => {
      const res = await request(app)
        .post("/api/auth/sign-up")
        .send({ email: "test@test.com" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/reset-password", () => {
    it("should return 200 for valid email", async () => {
      await User.create({
        username: "test@test.com",
        password: "hashed_password",
      });

      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({ email: "test@test.com" });

      expect(res.status).toBe(200);
    });

    it("should return 200 for non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({ email: "nonexistent@test.com" });

      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/auth/reset-password/verify", () => {
    it("should return 404 when no password reset record exists", async () => {
      await User.create({
        username: "test@test.com",
        password: "hashed_password",
      });

      const res = await request(app)
        .post("/api/auth/reset-password/verify")
        .send({ email: "test@test.com", token: "valid_token", password: "newpassword" });

      expect(res.status).toBe(404);
    });

    it("should return 404 for invalid token", async () => {
      await User.create({
        username: "test@test.com",
        password: "hashed_password",
      });

      const res = await request(app)
        .post("/api/auth/reset-password/verify")
        .send({ email: "test@test.com", token: "invalid_token", password: "newpassword" });

      expect(res.status).toBe(404);
    });
  });
});
