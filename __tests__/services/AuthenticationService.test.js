const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

jest.mock("jsonwebtoken");
jest.mock("bcrypt");

const AuthenticationService = require("../../src/services/AuthenticationService");

describe("AuthenticationService", () => {
  beforeEach(() => {
    AuthenticationService.destroyInstance();
    jest.clearAllMocks();
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
    it("should generate JWT token", () => {
      const mockUser = { 
        toObject: jest.fn().mockReturnValue({ _id: "user123", email: "test@test.com" }) 
      };
      jwt.sign.mockReturnValue("signed_token");

      const service = AuthenticationService.getInstance();
      const result = service.generateSessionToken(mockUser);

      expect(result).toBe("signed_token");
      expect(jwt.sign).toHaveBeenCalled();
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
