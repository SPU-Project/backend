// models/associations.js

const BahanBakuModel = require("./BahanBakuModel");
const ProdukModel = require("./ProdukModel");
const ProdukBahanBakuModel = require("./ProdukBahanBakuModel");
const KemasanModel = require("./KemasanModel");
const OverheadModel = require("./OverheadModel");
const StokBahanBaku = require("./StokBahanBakuModel");
const StatusProduksiModel = require("./StatusProduksiModel");

// BahanBakuModel and StokBahanBaku one-to-one association
BahanBakuModel.hasOne(StokBahanBaku, {
  foreignKey: "BahanBakuId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

StokBahanBaku.belongsTo(BahanBakuModel, {
  foreignKey: "BahanBakuId",
});

// ProdukModel and StatusProduksiModel one-to-one association
ProdukModel.hasOne(StatusProduksiModel, {
  foreignKey: "IdProduk",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

StatusProduksiModel.belongsTo(ProdukModel, {
  foreignKey: "IdProduk",
});

// ProdukModel and BahanBakuModel many-to-many association through ProdukBahanBakuModel
ProdukModel.belongsToMany(BahanBakuModel, {
  through: ProdukBahanBakuModel,
  as: "bahanbakumodel",
  foreignKey: "produkId",
});

BahanBakuModel.belongsToMany(ProdukModel, {
  through: ProdukBahanBakuModel,
  as: "ProdukModel",
  foreignKey: "bahanBakuId",
});

// ProdukBahanBakuModel associations
ProdukBahanBakuModel.belongsTo(BahanBakuModel, {
  foreignKey: "bahanBakuId",
  as: "bahanbakumodel",
});

ProdukBahanBakuModel.belongsTo(ProdukModel, {
  foreignKey: "produkId",
  as: "ProdukModel",
});

// ProdukModel and KemasanModel one-to-many association
ProdukModel.hasMany(KemasanModel, {
  foreignKey: "produkId",
  as: "kemasans",
});

KemasanModel.belongsTo(ProdukModel, {
  foreignKey: "produkId",
  as: "ProdukModel",
});

// ProdukModel and OverheadModel one-to-many association
ProdukModel.hasMany(OverheadModel, {
  foreignKey: "produkId",
  as: "overheads",
});

OverheadModel.belongsTo(ProdukModel, {
  foreignKey: "produkId",
  as: "ProdukModel",
});
