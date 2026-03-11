const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

jest.mock("nodemailer");

const EmailService = require("../../src/services/EmailService");
const UserService = require("../../src/services/UserService");
const PasswordResetService = require("../../src/services/PasswordResetService");
const User = require("../../src/models/User");

describe("EmailService", () => {
  let mockTransporter;

  beforeEach(() => {
    jest.clearAllMocks();
    EmailService.destroyInstance();
    UserService.destroyInstance();
    PasswordResetService.destroyInstance();

    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue(true),
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);
  });

  afterEach(() => {
    EmailService.destroyInstance();
    UserService.destroyInstance();
    PasswordResetService.destroyInstance();
  });

  describe("getInstance", () => {
    it("should return the same instance (singleton)", () => {
      const instance1 = EmailService.getInstance();
      const instance2 = EmailService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("sendEmail", () => {
    it("should send email successfully", async () => {
      const service = EmailService.getInstance();
      
      await service.sendEmail("test@test.com", "Test Subject", "Test Content");

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        to: "test@test.com",
        subject: "Test Subject",
        html: "Test Content",
      });
    });
  });

  describe("sendResetPasswordEmail", () => {
    it("should send reset password email", async () => {
      const service = EmailService.getInstance();
      
      await service.sendResetPasswordEmail("test@test.com", "reset_token");

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        to: "test@test.com",
        subject: "Reset password",
        html: "reset_token",
      });
    });
  });

  describe("sendResetPasswordEmailFlow", () => {
    it("should send reset password email when user exists", async () => {
      const user = await User.create({
        username: "test@test.com",
        password: "hashed_password",
      });

      const service = EmailService.getInstance();
      await service.sendResetPasswordEmailFlow("test@test.com");

      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });

    it("should not send email when user does not exist", async () => {
      const service = EmailService.getInstance();
      await service.sendResetPasswordEmailFlow("nonexistent@test.com");

      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });
  });

  describe("destroyInstance", () => {
    it("should allow creating a new instance after destroying", () => {
      const instance1 = EmailService.getInstance();
      EmailService.destroyInstance();
      
      const instance2 = EmailService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });
});
