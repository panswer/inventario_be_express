const mongoose = require("mongoose");
const User = require("../../src/models/User");

describe("User Model", () => {
  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe("Schema Validation", () => {
    it("should throw error when username is missing", async () => {
      const user = new User({ password: "password123" });

      await expect(user.save()).rejects.toThrow("username is required");
    });

    it("should throw error when password is missing", async () => {
      const user = new User({ username: "test@test.com" });

      await expect(user.save()).rejects.toThrow("password is required");
    });

    it("should create user with valid data", async () => {
      const user = new User({
        username: "test@test.com",
        password: "password123",
      });

      const savedUser = await user.save();

      expect(savedUser.username).toBe("test@test.com");
      expect(savedUser.password).toBe("password123");
      expect(savedUser._id).toBeDefined();
    });

    it("should enforce unique username", async () => {
      await User.create({
        username: "test@test.com",
        password: "password123",
      });

      const duplicateUser = new User({
        username: "test@test.com",
        password: "anotherpassword",
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });
  });

  describe("toJSON Transform", () => {
    it("should remove password from toJSON output", async () => {
      const user = new User({
        username: "test@test.com",
        password: "password123",
      });
      await user.save();

      const json = user.toJSON();

      expect(json.password).toBeUndefined();
    });

    it("should convert createdAt to timestamp in toJSON", async () => {
      const user = new User({
        username: "test@test.com",
        password: "password123",
      });
      await user.save();

      const savedUser = await User.findOne({ username: "test@test.com" });
      const json = savedUser.toJSON();

      expect(json.createdAt).toBeDefined();
      expect(typeof json.createdAt).toBe("number");
    });
  });

  describe("toObject Transform", () => {
    it("should remove password from toObject output", async () => {
      const user = new User({
        username: "test@test.com",
        password: "password123",
      });

      const obj = user.toObject();

      expect(obj.password).toBeUndefined();
    });
  });

  describe("Timestamps", () => {
    it("should have createdAt and updatedAt fields", async () => {
      const user = await User.create({
        username: "test@test.com",
        password: "password123",
      });

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });
  });
});
