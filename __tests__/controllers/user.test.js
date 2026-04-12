const mongoose = require("mongoose");
const userController = require("../../src/controllers/user");

jest.mock("../../src/services/UserService");
jest.mock("../../src/services/LoggerService");

const UserService = require("../../src/services/UserService");
const LoggerService = require("../../src/services/LoggerService");

describe("UserController", () => {
  let mockReq;
  let mockRes;
  let mockUserService;
  let mockLoggerService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      query: {},
      body: {},
      params: {},
      requestId: "request123",
      userIp: "127.0.0.1",
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockUserService = {
      getAllUsers: jest.fn(),
      updateUserRole: jest.fn(),
      assignWarehouse: jest.fn(),
    };

    mockLoggerService = {
      error: jest.fn(),
      warn: jest.fn(),
    };

    UserService.getInstance.mockReturnValue(mockUserService);
    LoggerService.getInstance.mockReturnValue(mockLoggerService);
  });

  describe("getUsers", () => {
    it("should return all users", async () => {
      const mockUsers = [{ _id: "1", username: "test@test.com" }];
      mockUserService.getAllUsers.mockResolvedValue(mockUsers);

      await userController.getUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ users: mockUsers });
    });

    it("should return 500 on service error", async () => {
      mockUserService.getAllUsers.mockRejectedValue(new Error("Error"));

      await userController.getUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Internal error" });
    });
  });

  describe("updateUserRole", () => {
    it("should update user role successfully", async () => {
      const mockUser = { _id: "1", username: "test@test.com", role: "manager" };
      mockReq.params = { id: "1" };
      mockReq.body = { role: "manager" };
      mockUserService.updateUserRole.mockResolvedValue(mockUser);

      await userController.updateUserRole(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ user: mockUser });
    });

    it("should return 404 if user not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockReq.body = { role: "manager" };
      mockUserService.updateUserRole.mockRejectedValue(new Error("User not found"));

      await userController.updateUserRole(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should return 400 for invalid role", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = { role: "invalid" };
      mockUserService.updateUserRole.mockRejectedValue(new Error("Invalid role"));

      await userController.updateUserRole(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Invalid role" });
    });

    it("should return 500 on service error", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = { role: "manager" };
      mockUserService.updateUserRole.mockRejectedValue(new Error("Error"));

      await userController.updateUserRole(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("assignWarehouse", () => {
    it("should assign warehouse to user successfully", async () => {
      const warehouseId = new mongoose.Types.ObjectId();
      const mockUser = {
        _id: "1",
        username: "test@test.com",
        warehouseId: warehouseId.toString(),
      };
      mockReq.params = { id: "1" };
      mockReq.body = { warehouseId: warehouseId.toString() };
      mockUserService.assignWarehouse.mockResolvedValue(mockUser);

      await userController.assignWarehouse(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ user: mockUser });
    });

    it("should return 404 if user not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockReq.body = { warehouseId: new mongoose.Types.ObjectId().toString() };
      mockUserService.assignWarehouse.mockRejectedValue(new Error("User not found"));

      await userController.assignWarehouse(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should return 500 on service error", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = { warehouseId: new mongoose.Types.ObjectId().toString() };
      mockUserService.assignWarehouse.mockRejectedValue(new Error("Error"));

      await userController.assignWarehouse(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Internal error" });
    });
  });
});