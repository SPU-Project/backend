// models/associations.js

const BahanBakuModel = require("./BahanBakuModel");
const StokBahanBaku = require("./StokBahanBakuModel");

// Define the one-to-one association
BahanBakuModel.hasOne(StokBahanBaku, {
  foreignKey: "BahanBakuId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

StokBahanBaku.belongsTo(BahanBakuModel, {
  foreignKey: "BahanBakuId",
});
