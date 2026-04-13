const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

jest.mock("jsonwebtoken");
jest.mock("bcrypt");
jest.mock("crypto", () => ({
  randomUUID: jest.fn(() => "test-session-id-123"),
}));

jest.mock("../../src/models/Session", () => ({
  countDocuments: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(() => ({
    sort: jest.fn(() => ({
      limit: jest.fn(() => ({
        select: jest.fn(),
      })),
    })),
  })),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
}));

const AuthenticationService = require("../../src/services/AuthenticationService");
const Session = require("../../src/models/Session");

describe("AuthenticationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AuthenticationService.destroyInstance();
  });

  afterEach(() => {
    AuthenticationService.destroyInstance();
  });

  describe("getInstance", () => {
    it("should return the same instance (singleton)", () => {
      const instance1 = AuthenticationService.getInstance();
      const instance2 = AuthenticationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("verifyPasswordHash", () => {
    it("should return true for valid password", () => {
      bcrypt.compareSync.mockReturnValue(true);

      const service = AuthenticationService.getInstance();
      const result = service.verifyPasswordHash("password", "hash");

      expect(result).toBe(true);
    });

    it("should return false for invalid password", () => {
      bcrypt.compareSync.mockReturnValue(false);

      const service = AuthenticationService.getInstance();
      const result = service.verifyPasswordHash("wrongpassword", "hash");

      expect(result).toBe(false);
    });
  });

  describe("generatePasswordHash", () => {
    it("should generate password hash", () => {
      bcrypt.hashSync.mockReturnValue("hashed_password");

      const service = AuthenticationService.getInstance();
      const result = service.generatePasswordHash("password");

      expect(result).toBe("hashed_password");
      expect(bcrypt.hashSync).toHaveBeenCalledWith("password", 12);
    });
  });

  describe("verifySessionToken", () => {
    it("should return decoded token for valid token", () => {
      const decoded = { _id: "user123", email: "test@test.com" };
      jwt.verify.mockReturnValue(decoded);

      const service = AuthenticationService.getInstance();
      const result = service.verifySessionToken("valid_token");

      expect(result).toEqual(decoded);
    });

    it("should throw error for invalid token", () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const service = AuthenticationService.getInstance();

      expect(() => service.verifySessionToken("invalid_token"))
        .toThrow("Invalid token");
    });
  });

  describe("generateSessionToken", () => {
    it("should generate JWT token with sessionId", () => {
      const mockUser = { 
        toObject: jest.fn().mockReturnValue({ _id: "user123", username: "test", role: "user" }) 
      };
      jwt.sign.mockReturnValue("signed_token");

      const service = AuthenticationService.getInstance();
      const result = service.generateSessionToken(mockUser);

      expect(result).toEqual({
        token: "signed_token",
        sessionId: "test-session-id-123",
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: "user123",
          sessionId: "test-session-id-123",
        }),
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe("saveSession", () => {
    it("should create session when under limit", async () => {
      Session.countDocuments.mockResolvedValue(2);
      Session.create.mockResolvedValue({});

      const service = AuthenticationService.getInstance();
      await service.saveSession("user123", "session-id");

      expect(Session.create).toHaveBeenCalledWith({
        userId: "user123",
        sessionId: "session-id",
      });
    });

    it("should delete oldest sessions when over limit", async () => {
      Session.countDocuments.mockResolvedValue(3);
      Session.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue([{ _id: "old1" }, { _id: "old2" }]),
          }),
        }),
      });
      Session.deleteMany.mockResolvedValue({});

      const service = AuthenticationService.getInstance();
      await service.saveSession("user123", "new-session");

      expect(Session.deleteMany).toHaveBeenCalledWith({
        _id: { $in: ["old1", "old2"] },
      });
    });
  });

  describe("validateSession", () => {
    it("should return true when session exists", async () => {
      Session.findOne.mockResolvedValue({ sessionId: "session123" });

      const service = AuthenticationService.getInstance();
      const result = await service.validateSession("user123", "session123");

      expect(result).toBe(true);
    });

    it("should return false when session does not exist", async () => {
      Session.findOne.mockResolvedValue(null);

      const service = AuthenticationService.getInstance();
      const result = await service.validateSession("user123", "invalid");

      expect(result).toBe(false);
    });
  });

  describe("deleteSession", () => {
    it("should delete session from database", async () => {
      Session.deleteOne.mockResolvedValue({});

      const service = AuthenticationService.getInstance();
      await service.deleteSession("user123", "session123");

      expect(Session.deleteOne).toHaveBeenCalledWith({
        userId: "user123",
        sessionId: "session123",
      });
    });
  });

  describe("destroyInstance", () => {
    it("should allow creating a new instance after destroying", () => {
      const instance1 = AuthenticationService.getInstance();
      AuthenticationService.destroyInstance();
      
      const instance2 = AuthenticationService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });
});
