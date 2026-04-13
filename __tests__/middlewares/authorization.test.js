const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

jest.mock("../../src/services/AuthenticationService", () => ({
  getInstance: jest.fn().mockReturnValue({
    validateSession: jest.fn().mockResolvedValue(true),
  }),
}));

const { authorizationFn } = require("../../src/middlewares/authorization");

describe("authorization middleware", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      get: jest.fn(),
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("authorizationFn", () => {
    it("should return 403 if no Authorization header", async () => {
      mockReq.get.mockReturnValue(undefined);

      await authorizationFn(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Forbidden" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 403 if Authorization header is not a string", async () => {
      mockReq.get.mockReturnValue(123);

      await authorizationFn(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Forbidden" });
    });

    it("should return 401 if token is invalid", async () => {
      mockReq.get.mockReturnValue("Bearer invalidtoken");
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await authorizationFn(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if session is invalid", async () => {
      const { getInstance } = require("../../src/services/AuthenticationService");
      getInstance.mockReturnValueOnce({
        validateSession: jest.fn().mockResolvedValue(false),
      });

      const mockUser = { _id: "user123", sessionId: "session123" };
      mockReq.get.mockReturnValue("Bearer validtoken");
      jwt.verify.mockReturnValue(mockUser);

      await authorizationFn(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next() and add session to req.body if token and session are valid", async () => {
      const mockUser = { _id: "user123", sessionId: "session123" };
      mockReq.get.mockReturnValue("Bearer validtoken");
      jwt.verify.mockReturnValue(mockUser);

      await authorizationFn(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.body.session).toEqual(mockUser);
    });

    it("should handle Bearer token format correctly", async () => {
      const { getInstance } = require("../../src/services/AuthenticationService");
      getInstance.mockReturnValueOnce({
        validateSession: jest.fn().mockResolvedValue(true),
      });

      const mockUser = { _id: "user123", sessionId: "session123" };
      mockReq.get.mockReturnValue("Bearer token123");
      jwt.verify.mockReturnValue(mockUser);

      await authorizationFn(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith("token123", process.env.SERVER_JWT_SESSION_SECRET);
    });
  });
});
