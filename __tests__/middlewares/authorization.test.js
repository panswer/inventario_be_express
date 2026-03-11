const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
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
    it("should return 403 if no Authorization header", () => {
      mockReq.get.mockReturnValue(undefined);

      authorizationFn(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Forbidden" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 403 if Authorization header is not a string", () => {
      mockReq.get.mockReturnValue(123);

      authorizationFn(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Forbidden" });
    });

    it("should return 401 if token is invalid", () => {
      mockReq.get.mockReturnValue("Bearer invalidtoken");
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      authorizationFn(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next() and add session to req.body if token is valid", () => {
      const mockUser = { _id: "user123", email: "test@test.com" };
      mockReq.get.mockReturnValue("Bearer validtoken");
      jwt.verify.mockReturnValue(mockUser);

      authorizationFn(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.body.session).toEqual(mockUser);
    });

    it("should handle Bearer token format correctly", () => {
      const mockUser = { _id: "user123" };
      mockReq.get.mockReturnValue("Bearer token123");
      jwt.verify.mockReturnValue(mockUser);

      authorizationFn(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith("token123", process.env.SERVER_JWT_SESSION_SECRET);
    });
  });
});
