// BahanBakuController.test.mjs
import assert from "assert";
import {
  addBahanBaku,
  updateBahanBaku,
  deleteBahanBaku,
  getAllBahanBaku,
} from "../controllers/BahanBaku.js";
import BahanBakuModel from "../models/BahanBakuModel.js";
import ProdukBahanBakuModel from "../models/ProdukBahanBakuModel.js";

describe("BahanBakuController", () => {
  describe("addBahanBaku", () => {
    it("should add a new Bahan Baku", async () => {
      const req = {
        body: {
          BahanBaku: "Test Bahan Baku",
          Harga: 10000,
        },
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

      await addBahanBaku(req, res);

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(
        res.jsonData.message,
        "Bahan Baku Berhasil Ditambahkan"
      );
      assert.strictEqual(res.jsonData.data.BahanBaku, "Test Bahan Baku");
      assert.strictEqual(res.jsonData.data.Harga, 10000);
    });
  });

  describe("updateBahanBaku", () => {
    it("should update a Bahan Baku", async () => {
      const existingBahanBaku = {
        id: 1,
        BahanBaku: "Existing Bahan Baku",
        Harga: 5000,
        save: async function () {},
      };
      BahanBakuModel.findByPk = async () => existingBahanBaku;

      const req = {
        params: { id: 1 },
        body: {
          BahanBaku: "Updated Bahan Baku",
          Harga: 8000,
        },
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

      await updateBahanBaku(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.jsonData.message, "Bahan Baku Berhasil Diupdate");
      assert.strictEqual(res.jsonData.data.BahanBaku, "Updated Bahan Baku");
      assert.strictEqual(res.jsonData.data.Harga, 8000);
    });
  });

  describe("deleteBahanBaku", () => {
    it("should delete a Bahan Baku", async () => {
      const existingBahanBaku = {
        id: 1,
        destroy: async function () {},
      };
      BahanBakuModel.findByPk = async () => existingBahanBaku;
      ProdukBahanBakuModel.findOne = async () => null;

      const req = {
        params: { id: 1 },
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

      await deleteBahanBaku(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.jsonData.message, "Bahan Baku Berhasil Dihapus");
    });
  });

  describe("getAllBahanBaku", () => {
    it("should get all Bahan Baku", async () => {
      const bahanBakuList = [
        { id: 1, BahanBaku: "Bahan Baku 1", Harga: 5000 },
        { id: 2, BahanBaku: "Bahan Baku 2", Harga: 8000 },
      ];
      BahanBakuModel.findAll = async () => bahanBakuList;

      const req = {};
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

      await getAllBahanBaku(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.jsonData.message, "Daftar Bahan Baku");
      assert.deepStrictEqual(res.jsonData.data, bahanBakuList);
    });
  });
});
