const authenticationController = require("../../src/controllers/authentication");

jest.mock("../../src/services/UserService");
jest.mock("../../src/services/EmailService");
jest.mock("../../src/services/PasswordResetService");
jest.mock("../../src/services/AuthenticationService");

const UserService = require("../../src/services/UserService");
const EmailService = require("../../src/services/EmailService");
const PasswordResetService = require("../../src/services/PasswordResetService");
const AuthenticationService = require("../../src/services/AuthenticationService");

describe("AuthenticationController", () => {
  let mockReq;
  let mockRes;
  let mockUserService;
  let mockEmailService;
  let mockPasswordResetService;
  let mockAuthenticationService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      query: {},
      body: {},
      params: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockUserService = {
      createUser: jest.fn(),
      getUserByEmail: jest.fn(),
      getUserByEmailFlow: jest.fn(),
      updateUserPassword: jest.fn(),
    };

    mockEmailService = {
      sendResetPasswordEmailFlow: jest.fn(),
    };

    mockPasswordResetService = {
      validateTokenByEmailFlow: jest.fn(),
    };

    mockAuthenticationService = {
      verifyPasswordHash: jest.fn(),
      generateSessionToken: jest.fn(),
    };

    UserService.getInstance.mockReturnValue(mockUserService);
    EmailService.getInstance.mockReturnValue(mockEmailService);
    PasswordResetService.getInstance.mockReturnValue(mockPasswordResetService);
    AuthenticationService.getInstance.mockReturnValue(mockAuthenticationService);
  });

  describe("signUp", () => {
    it("should create user successfully", async () => {
      const mockUser = { _id: "user123", username: "test@test.com" };
      mockReq.body = { email: "test@test.com", password: "password123" };
      mockUserService.createUser.mockResolvedValue(mockUser);

      await authenticationController.signUp(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockUser);
    });

    it("should return 400 if user creation fails", async () => {
      mockReq.body = { email: "test@test.com", password: "password123" };
      mockUserService.createUser.mockRejectedValue(new Error("Error"));

      await authenticationController.signUp(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 1000 });
    });
  });

  describe("signIn", () => {
    it("should return 403 if user not found", async () => {
      mockReq.body = { email: "nonexistent@test.com", password: "password123" };
      mockUserService.getUserByEmailFlow.mockRejectedValue(new Error("User not found"));

      await authenticationController.signIn(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 1001 });
    });

    it("should return 403 if password is invalid", async () => {
      const mockUser = { _id: "user123", username: "test@test.com", password: "hashed_password" };
      mockReq.body = { email: "test@test.com", password: "wrongpassword" };
      mockUserService.getUserByEmailFlow.mockResolvedValue(mockUser);
      mockAuthenticationService.verifyPasswordHash.mockReturnValue(false);

      await authenticationController.signIn(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ code: 1001 });
    });

    it("should return token if login successful", async () => {
      const mockUser = { _id: "user123", username: "test@test.com", password: "hashed_password" };
      mockReq.body = { email: "test@test.com", password: "password123" };
      mockUserService.getUserByEmailFlow.mockResolvedValue(mockUser);
      mockAuthenticationService.verifyPasswordHash.mockReturnValue(true);
      mockAuthenticationService.generateSessionToken.mockReturnValue("jwt_token");

      await authenticationController.signIn(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ authorization: "jwt_token" });
    });
  });

  describe("resetPassword", () => {
    it("should send reset email successfully", async () => {
      mockReq.body = { email: "test@test.com" };
      mockEmailService.sendResetPasswordEmailFlow.mockResolvedValue(true);

      await authenticationController.resetPassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should return 500 if email sending fails", async () => {
      mockReq.body = { email: "test@test.com" };
      mockEmailService.sendResetPasswordEmailFlow.mockRejectedValue(new Error("Error"));

      await authenticationController.resetPassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("resetPasswordVerify", () => {
    it("should return 404 if token validation fails", async () => {
      mockReq.body = { email: "test@test.com", token: "invalid_token", password: "newpassword" };
      mockPasswordResetService.validateTokenByEmailFlow.mockRejectedValue(new Error("Invalid token"));

      await authenticationController.resetPasswordVerify(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should return 500 if password update fails", async () => {
      mockReq.body = { email: "test@test.com", token: "valid_token", password: "newpassword" };
      mockPasswordResetService.validateTokenByEmailFlow.mockResolvedValue(true);
      mockUserService.updateUserPassword.mockRejectedValue(new Error("Error"));

      await authenticationController.resetPasswordVerify(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it("should update password successfully", async () => {
      mockReq.body = { email: "test@test.com", token: "valid_token", password: "newpassword" };
      mockPasswordResetService.validateTokenByEmailFlow.mockResolvedValue(true);
      mockUserService.updateUserPassword.mockResolvedValue(true);

      await authenticationController.resetPasswordVerify(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(202);
    });
  });
});
