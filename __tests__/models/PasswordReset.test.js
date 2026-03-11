const mongoose = require("mongoose");
const PasswordReset = require("../../src/models/PasswordReset");

describe("PasswordReset Model", () => {
  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe("Schema Validation", () => {
    it("should throw error when userId is missing", async () => {
      const passwordReset = new PasswordReset({
        token: "abc123",
      });

      await expect(passwordReset.save()).rejects.toThrow("user id is required");
    });

    it("should throw error when token is missing", async () => {
      const userId = new mongoose.Types.ObjectId();
      const passwordReset = new PasswordReset({
        userId,
      });

      await expect(passwordReset.save()).rejects.toThrow("token is required");
    });

    it("should create passwordReset with valid data", async () => {
      const userId = new mongoose.Types.ObjectId();
      const passwordReset = new PasswordReset({
        userId,
        token: "abc123",
      });

      const savedPasswordReset = await passwordReset.save();

      expect(savedPasswordReset.userId).toEqual(userId);
      expect(savedPasswordReset.token).toBe("abc123");
      expect(savedPasswordReset._id).toBeDefined();
    });

    it("should create passwordReset with ObjectId ref", async () => {
      const userId = new mongoose.Types.ObjectId();
      const passwordReset = new PasswordReset({
        userId,
        token: "abc123",
      });

      const savedPasswordReset = await passwordReset.save();

      expect(savedPasswordReset.userId).toBeInstanceOf(mongoose.Types.ObjectId);
    });
  });

  describe("Timestamps", () => {
    it("should have createdAt field", async () => {
      const userId = new mongoose.Types.ObjectId();
      const passwordReset = await PasswordReset.create({
        userId,
        token: "abc123",
      });

      expect(passwordReset.createdAt).toBeDefined();
    });

    it("should have updatedAt field by default in Mongoose", async () => {
      const userId = new mongoose.Types.ObjectId();
      const passwordReset = await PasswordReset.create({
        userId,
        token: "abc123",
      });

      expect(passwordReset.updatedAt).toBeDefined();
    });
  });
});
