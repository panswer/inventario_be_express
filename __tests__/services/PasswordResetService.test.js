const mongoose = require("mongoose");
const PasswordResetService = require("../../src/services/PasswordResetService");
const UserService = require("../../src/services/UserService");
const PasswordReset = require("../../src/models/PasswordReset");
const User = require("../../src/models/User");
const { createHash } = require("../../src/utils/random");

describe("PasswordResetService", () => {
  beforeEach(() => {
    PasswordResetService.destroyInstance();
    UserService.destroyInstance();
  });

  afterEach(() => {
    PasswordResetService.destroyInstance();
    UserService.destroyInstance();
  });

  describe("getInstance", () => {
    it("should return the same instance (singleton)", () => {
      const instance1 = PasswordResetService.getInstance();
      const instance2 = PasswordResetService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("createPasswordReset", () => {
    it("should create a new password reset token", async () => {
      const userId = new mongoose.Types.ObjectId();
      const token = "test_token";

      const service = PasswordResetService.getInstance();
      const result = await service.createPasswordReset(userId, token);

      expect(result).toBeTruthy();
      expect(result.userId).toEqual(userId);
      expect(result.token).toBe(createHash(token));
    });
  });

  describe("getPasswordResetByUserId", () => {
    it("should return token when found and not expired", async () => {
      const userId = new mongoose.Types.ObjectId();
      const token = "test_token";
      
      await PasswordReset.create({
        userId,
        token: createHash(token),
      });

      const service = PasswordResetService.getInstance();
      const result = await service.getPasswordResetByUserId(userId);

      expect(result).toBeTruthy();
      expect(result.userId).toEqual(userId);
    });

    it("should return null when token is expired", async () => {
      const userId = new mongoose.Types.ObjectId();
      const token = "test_token";
      
      const expiredToken = await PasswordReset.create({
        userId,
        token: createHash(token),
        createdAt: new Date(Date.now() - 1000 * 60 * 20),
      });

      const service = PasswordResetService.getInstance();
      const result = await service.getPasswordResetByUserId(userId);

      expect(result).toBeNull();
    });
  });

  describe("validateTokenByEmailFlow", () => {
    it("should validate token successfully", async () => {
      const user = await User.create({
        username: "test@test.com",
        password: "hashed_password",
      });

      const token = "test_token";
      await PasswordReset.create({
        userId: user._id,
        token: createHash(token),
      });

      const service = PasswordResetService.getInstance();
      await service.validateTokenByEmailFlow("test@test.com", token);

      const deletedToken = await PasswordReset.findOne({ userId: user._id });
      expect(deletedToken).toBeNull();
    });

    it("should throw error when user not found", async () => {
      const service = PasswordResetService.getInstance();

      await expect(service.validateTokenByEmailFlow("nonexistent@test.com", "token"))
        .rejects.toThrow("User not found");
    });

    it("should throw error when token not found", async () => {
      const user = await User.create({
        username: "test@test.com",
        password: "hashed_password",
      });

      const service = PasswordResetService.getInstance();

      await expect(service.validateTokenByEmailFlow("test@test.com", "nonexistent_token"))
        .rejects.toThrow("Intento de recuperación con token inválido o expirado");
    });

    it("should throw error when token is invalid", async () => {
      const user = await User.create({
        username: "test@test.com",
        password: "hashed_password",
      });

      const token = "test_token";
      await PasswordReset.create({
        userId: user._id,
        token: createHash(token),
      });

      const service = PasswordResetService.getInstance();

      await expect(service.validateTokenByEmailFlow("test@test.com", "wrong_token"))
        .rejects.toThrow("Intento de recuperación con token inválido o expirado");
    });
  });

  describe("deleteTokenByUserId", () => {
    it("should delete token by userId", async () => {
      const userId = new mongoose.Types.ObjectId();
      
      await PasswordReset.create({
        userId,
        token: createHash("token"),
      });

      const service = PasswordResetService.getInstance();
      await service.deleteTokenByUserId(userId);

      const result = await PasswordReset.findOne({ userId });
      expect(result).toBeNull();
    });
  });

  describe("destroyInstance", () => {
    it("should allow creating a new instance after destroying", () => {
      const instance1 = PasswordResetService.getInstance();
      PasswordResetService.destroyInstance();
      
      const instance2 = PasswordResetService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });
});
