// uploadController.test.mjs
import assert from "assert";
import {
  uploadProfileImage,
  getProfileImage,
} from "../controllers/uploadController.js";
import Admin from "../models/AdminModel.js";
import path from "path";

describe("uploadController", () => {
  describe("uploadProfileImage", () => {
    it("should upload profile image successfully", async () => {
      const req = {
        session: { userId: 1 },
        file: { path: "path/to/image.jpg" },
      };
      const res = {
        status: function (statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        json: function (data) {
          this.jsonData = data;
          return this;
        },
      };

      // Mock dependencies
      Admin.findByPk = async () => ({ save: async () => {} });

      await uploadProfileImage(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(
        res.jsonData.message,
        "Gambar profil berhasil diunggah"
      );
      assert.strictEqual(res.jsonData.profileImage, "path/to/image.jpg");
    });

    it("should return 401 if user is not logged in", async () => {
      const req = {
        session: {},
        file: { path: "path/to/image.jpg" },
      };
      const res = {
        status: function (statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        json: function (data) {
          this.jsonData = data;
          return this;
        },
      };

      await uploadProfileImage(req, res);

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.jsonData.message, "Anda belum login");
    });

    it("should return 404 if admin is not found", async () => {
      const req = {
        session: { userId: 1 },
        file: { path: "path/to/image.jpg" },
      };
      const res = {
        status: function (statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        json: function (data) {
          this.jsonData = data;
          return this;
        },
      };

      // Mock dependencies
      Admin.findByPk = async () => null;

      await uploadProfileImage(req, res);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.jsonData.message, "Admin tidak ditemukan");
    });
  });

  describe("getProfileImage", () => {
    it("should get profile image successfully", async () => {
      const req = {
        session: { userId: 1 },
      };
      const res = {
        status: function (statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        sendFile: function (filePath) {
          this.filePath = filePath;
          return this;
        },
      };

      // Mock dependencies
      Admin.findByPk = async () => ({ profileImage: "path/to/image.jpg" });
      path.resolve = (filePath) => filePath;

      await getProfileImage(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.filePath, "path/to/image.jpg");
    });

    it("should return 401 if user is not logged in", async () => {
      const req = {
        session: {},
      };
      const res = {
        status: function (statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        json: function (data) {
          this.jsonData = data;
          return this;
        },
      };

      await getProfileImage(req, res);

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.jsonData.message, "Anda belum login");
    });

    it("should return 404 if admin is not found", async () => {
      const req = {
        session: { userId: 1 },
      };
      const res = {
        status: function (statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        json: function (data) {
          this.jsonData = data;
          return this;
        },
      };

      // Mock dependencies
      Admin.findByPk = async () => null;

      await getProfileImage(req, res);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.jsonData.message, "Admin tidak ditemukan");
    });

    it("should return 404 if profile image is not found", async () => {
      const req = {
        session: { userId: 1 },
      };
      const res = {
        status: function (statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        json: function (data) {
          this.jsonData = data;
          return this;
        },
      };

      // Mock dependencies
      Admin.findByPk = async () => ({});

      await getProfileImage(req, res);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.jsonData.message, "Gambar profil tidak ditemukan");
    });
  });
});
