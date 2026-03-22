const path = require("path");
const fs = require("fs");
const { uploadDir } = require("../../src/config");

const {
  generateUUID,
  isValidImageFormat,
  getExtensionFromMimeType,
  saveProductImage,
  deleteProductImage,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
} = require("../../src/utils/fileUpload");

describe("fileUpload utils", () => {
  const testUploadDir = path.join(uploadDir, "test");

  beforeAll(() => {
    if (!fs.existsSync(testUploadDir)) {
      fs.mkdirSync(testUploadDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(testUploadDir)) {
      fs.rmSync(testUploadDir, { recursive: true, force: true });
    }
  });

  describe("generateUUID", () => {
    it("should return a valid UUID string", () => {
      const uuid = generateUUID();
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });

    it("should return different values on each call", () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe("isValidImageFormat", () => {
    it("should return true for jpeg mime type", () => {
      expect(isValidImageFormat("image/jpeg")).toBe(true);
    });

    it("should return true for jpg mime type", () => {
      expect(isValidImageFormat("image/jpg")).toBe(true);
    });

    it("should return true for svg mime type", () => {
      expect(isValidImageFormat("image/svg+xml")).toBe(true);
    });

    it("should return false for png mime type", () => {
      expect(isValidImageFormat("image/png")).toBe(false);
    });

    it("should return false for gif mime type", () => {
      expect(isValidImageFormat("image/gif")).toBe(false);
    });

    it("should return false for webp mime type", () => {
      expect(isValidImageFormat("image/webp")).toBe(false);
    });

    it("should return false for pdf mime type", () => {
      expect(isValidImageFormat("application/pdf")).toBe(false);
    });
  });

  describe("getExtensionFromMimeType", () => {
    it("should return .jpg for image/jpeg", () => {
      expect(getExtensionFromMimeType("image/jpeg")).toBe(".jpg");
    });

    it("should return .jpg for image/jpg", () => {
      expect(getExtensionFromMimeType("image/jpg")).toBe(".jpg");
    });

    it("should return .svg for image/svg+xml", () => {
      expect(getExtensionFromMimeType("image/svg+xml")).toBe(".svg");
    });

    it("should return .jpg for unknown mime types", () => {
      expect(getExtensionFromMimeType("image/png")).toBe(".jpg");
    });
  });

  describe("ALLOWED_MIME_TYPES", () => {
    it("should contain only allowed mime types", () => {
      expect(ALLOWED_MIME_TYPES).toContain("image/jpeg");
      expect(ALLOWED_MIME_TYPES).toContain("image/jpg");
      expect(ALLOWED_MIME_TYPES).toContain("image/svg+xml");
      expect(ALLOWED_MIME_TYPES).toHaveLength(3);
    });
  });

  describe("ALLOWED_EXTENSIONS", () => {
    it("should contain only allowed extensions", () => {
      expect(ALLOWED_EXTENSIONS).toContain(".jpg");
      expect(ALLOWED_EXTENSIONS).toContain(".jpeg");
      expect(ALLOWED_EXTENSIONS).toContain(".svg");
      expect(ALLOWED_EXTENSIONS).toHaveLength(3);
    });
  });

  describe("deleteProductImage", () => {
    it("should not throw when imagePath is null", () => {
      expect(() => deleteProductImage(null)).not.toThrow();
    });

    it("should not throw when imagePath is undefined", () => {
      expect(() => deleteProductImage(undefined)).not.toThrow();
    });

    it("should not throw when imagePath is empty string", () => {
      expect(() => deleteProductImage("")).not.toThrow();
    });

    it("should delete existing file with absolute path", () => {
      const testFile = path.resolve(uploadDir, "test-delete-file.txt");
      fs.writeFileSync(testFile, "test content");

      expect(fs.existsSync(testFile)).toBe(true);

      deleteProductImage(testFile);

      expect(fs.existsSync(testFile)).toBe(false);
    });

    it("should delete existing file with relative path", () => {
      const testFileName = "test-delete-relative.txt";
      const testFile = path.resolve(uploadDir, testFileName);
      fs.writeFileSync(testFile, "test content");

      expect(fs.existsSync(testFile)).toBe(true);

      deleteProductImage(testFileName);

      expect(fs.existsSync(testFile)).toBe(false);
    });

    it("should not throw when file does not exist", () => {
      expect(() => deleteProductImage("/non/existent/file.jpg")).not.toThrow();
    });
  });
});
