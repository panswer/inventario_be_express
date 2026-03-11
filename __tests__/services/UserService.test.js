const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const UserService = require("../../src/services/UserService");
const User = require("../../src/models/User");

jest.mock("bcrypt", () => ({
  hashSync: jest.fn((password, salt) => `hashed_${password}`),
  compareSync: jest.fn(),
}));

describe("UserService", () => {
  beforeEach(() => {
    UserService.destroyInstance();
    jest.clearAllMocks();
  });

  afterEach(() => {
    UserService.destroyInstance();
  });

  describe("getInstance", () => {
    it("should return the same instance (singleton)", () => {
      const instance1 = UserService.getInstance();
      const instance2 = UserService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      const service = UserService.getInstance();
      const result = await service.createUser("test@test.com", "password123");

      expect(result).toBeTruthy();
      expect(result.username).toBe("test@test.com");
      expect(result.password).toBe("hashed_password123");
    });
  });

  describe("getUserByEmail", () => {
    it("should return user when found", async () => {
      const user = await User.create({
        username: "test@test.com",
        password: "hashed_password",
      });

      const service = UserService.getInstance();
      const result = await service.getUserByEmail("test@test.com");

      expect(result).toBeTruthy();
      expect(result.username).toBe("test@test.com");
    });

    it("should return null when not found", async () => {
      const service = UserService.getInstance();
      const result = await service.getUserByEmail("nonexistent@test.com");

      expect(result).toBeNull();
    });
  });

  describe("getUserByEmailFlow", () => {
    it("should return user when found", async () => {
      await User.create({
        username: "test@test.com",
        password: "hashed_password",
      });

      const service = UserService.getInstance();
      const result = await service.getUserByEmailFlow("test@test.com");

      expect(result).toBeTruthy();
      expect(result.username).toBe("test@test.com");
    });

    it("should throw error when not found", async () => {
      const service = UserService.getInstance();

      await expect(service.getUserByEmailFlow("nonexistent@test.com"))
        .rejects.toThrow("User not found");
    });
  });

  describe("updateUserPassword", () => {
    it("should update user password", async () => {
      const user = await User.create({
        username: "test@test.com",
        password: "old_password",
      });

      const service = UserService.getInstance();
      await service.updateUserPassword("test@test.com", "new_password");

      const updatedUser = await User.findOne({ username: "test@test.com" });
      expect(updatedUser.password).toBe("hashed_new_password");
    });
  });

  describe("destroyInstance", () => {
    it("should allow creating a new instance after destroying", () => {
      const instance1 = UserService.getInstance();
      UserService.destroyInstance();
      
      const instance2 = UserService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });
});
