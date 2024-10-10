// ProdukController.test.mjs
import assert from "assert";
import {
  addProduk,
  updateProduk,
  getAllProdukBahanBaku,
  getProdukBahanBakuByProdukId,
  deleteProduk,
} from "../controllers/Produk.js";
import ProdukModel from "../models/ProdukModel.js";
import BahanBakuModel from "../models/BahanBakuModel.js";
import OverheadModel from "../models/OverheadModel.js";
import KemasanModel from "../models/KemasanModel.js";
import ProdukBahanBakuModel from "../models/ProdukBahanBakuModel.js";

describe("ProdukController", () => {
  describe("addProduk", () => {
    it("should add a new product", async () => {
      const req = {
        body: {
          namaProduk: "Test Produk",
          bahanBaku: [
            { id: 1, jumlah: 100 },
            { id: 2, jumlah: 200 },
          ],
          overhead: [
            { namaOverhead: "Overhead 1", harga: 1000 },
            { namaOverhead: "Overhead 2", harga: 2000 },
          ],
          kemasan: [
            { namaKemasan: "Kemasan 1", harga: 500 },
            { namaKemasan: "Kemasan 2", harga: 1000 },
          ],
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

      // Mock dependencies
      BahanBakuModel.findOne = async () => ({ Harga: 10000 });
      ProdukModel.create = async () => ({ id: 1, ...req.body });
      ProdukBahanBakuModel.create = async () => ({});
      OverheadModel.create = async () => ({});
      KemasanModel.create = async () => ({});

      await addProduk(req, res);

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.jsonData.message, "Produk Berhasil Ditambahkan");
      assert.strictEqual(res.jsonData.data.namaProduk, "Test Produk");
    });
  });

  describe("updateProduk", () => {
    it("should update a product", async () => {
      const req = {
        params: { id: 1 },
        body: {
          namaProduk: "Updated Produk",
          bahanBaku: [
            { id: 1, jumlah: 150 },
            { id: 2, jumlah: 250 },
          ],
          overhead: [
            { namaOverhead: "Updated Overhead 1", harga: 1500 },
            { namaOverhead: "Updated Overhead 2", harga: 2500 },
          ],
          kemasan: [
            { namaKemasan: "Updated Kemasan 1", harga: 750 },
            { namaKemasan: "Updated Kemasan 2", harga: 1250 },
          ],
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

      // Mock dependencies
      ProdukModel.findByPk = async () => ({ id: 1, save: async () => {} });
      BahanBakuModel.findOne = async () => ({ Harga: 10000 });
      ProdukBahanBakuModel.destroy = async () => ({});
      ProdukBahanBakuModel.create = async () => ({});
      OverheadModel.destroy = async () => ({});
      OverheadModel.create = async () => ({});
      KemasanModel.destroy = async () => ({});
      KemasanModel.create = async () => ({});

      await updateProduk(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.jsonData.message, "Produk Berhasil Diperbarui");
      assert.strictEqual(res.jsonData.data.namaProduk, "Updated Produk");
    });
  });

  describe("getAllProdukBahanBaku", () => {
    it("should get all produk bahan baku", async () => {
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

      // Mock dependencies
      ProdukBahanBakuModel.findAll = async () => [
        {
          produk: {
            namaProduk: "Produk 1",
            kemasan: [{ namaKemasan: "Kemasan 1", harga: 500 }],
            overhead: [{ namaOverhead: "Overhead 1", harga: 1000 }],
          },
          bahanBaku: { BahanBaku: "Bahan Baku 1", Harga: 10000 },
        },
      ];

      await getAllProdukBahanBaku(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(
        res.jsonData.message,
        "Data Produk Bahan Baku berhasil diambil"
      );
      assert.strictEqual(res.jsonData.data[0].produk.namaProduk, "Produk 1");
      assert.strictEqual(
        res.jsonData.data[0].bahanBaku.BahanBaku,
        "Bahan Baku 1"
      );
    });
  });

  describe("getProdukBahanBakuByProdukId", () => {
    it("should get produk bahan baku by produk id", async () => {
      const req = {
        params: { produkId: 1 },
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
      ProdukBahanBakuModel.findAll = async () => [
        {
          produk: {
            namaProduk: "Produk 1",
            kemasan: [{ namaKemasan: "Kemasan 1", harga: 500 }],
            overhead: [{ namaOverhead: "Overhead 1", harga: 1000 }],
          },
          bahanBaku: { BahanBaku: "Bahan Baku 1", Harga: 10000 },
        },
      ];

      await getProdukBahanBakuByProdukId(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(
        res.jsonData.message,
        "Data Produk Bahan Baku berhasil diambil"
      );
      assert.strictEqual(res.jsonData.data[0].produk.namaProduk, "Produk 1");
      assert.strictEqual(
        res.jsonData.data[0].bahanBaku.BahanBaku,
        "Bahan Baku 1"
      );
    });
  });

  describe("deleteProduk", () => {
    it("should delete a product", async () => {
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

      // Mock dependencies
      ProdukModel.findByPk = async () => ({
        destroy: async () => {},
        sequelize: {
          transaction: async (callback) => {
            await callback();
          },
        },
      });
      ProdukBahanBakuModel.destroy = async () => ({});
      OverheadModel.destroy = async () => ({});
      KemasanModel.destroy = async () => ({});

      await deleteProduk(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(
        res.jsonData.message,
        "Produk dan data terkait berhasil dihapus"
      );
    });
  });
});
