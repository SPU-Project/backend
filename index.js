const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const db = require("./config/Database.js");
const SequelizeStore = require("connect-session-sequelize");
const Admin = require("./models/AdminModel.js");
const BahanBakuModel = require("./models/BahanBakuModel.js");
const KemasanModel = require("./models/KemasanModel.js");
const OverheadModel = require("./models/OverheadModel.js");
const ProdukBahanBakuModel = require("./models/ProdukBahanBakuModel.js");
const ProdukModel = require("./models/ProdukModel.js");
const RiwayatLog = require("./models/RiwayatLog.js");
const StokBahanBaku = require("./models/StokBahanBakuModel.js");
// route
const AuthRoute = require("./routes/AuthRoute.js");
const AdminRoute = require("./routes/AdminRoute.js");
const BahanBakuRoute = require("./routes/BahanBakuRoute.js");
const ProdukRoute = require("./routes/ProdukRoute.js");
const uploadRoute = require("./routes/uploadRoute.js");
const RiwayatRoute = require("./routes/RiwayatRoute.js");

require("./models/association.js");

//Test Connection Cpanel
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionStore = SequelizeStore(session.Store);
const store = new sessionStore({
  db: db,
  expiration: 10080 * 60 * 1000,
  checkExpirationInterval: 10080 * 60 * 1000,
});

// Immediately Invoked Function Expression (IIFE) to handle database operations
(async function () {
  try {
    await db.authenticate(); // Check connection to the database
    console.log("Database connected...");
    await db.sync({ alter: true });
    console.log("All models were synchronized successfully.");

    // Sync models
    await ProdukModel.sync({ alter: true });
    await Admin.sync({ alter: true });
    await BahanBakuModel.sync({ alter: true });
    await ProdukBahanBakuModel.sync({ alter: true });
    await OverheadModel.sync({ alter: true });
    await KemasanModel.sync({ alter: true });
    await RiwayatLog.sync({ alter: true });
    await StokBahanBaku.sync({ alter: true });

    console.log("Database synced...");
  } catch (error) {
    console.error("Unable to connect to the database or sync tables:", error);
  }
})();

const allowedOrigins = [
  "https://produksi.pabrikbumbu.com",
  "http://localhost:3000",
];

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        // Mengizinkan permintaan jika tidak ada header Origin (misalnya, dari Postman)
        callback(null, true);
      } else {
        callback(new Error("Origin tidak diizinkan oleh CORS"));
      }
    },
  })
);

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      secure: false,
      sameSite: "lax",
      httpOnly: true,
      maxAge: 10080 * 60 * 1000,
      // Jangan atur 'domain' di sini
    },
  })
);

// Define your routes after middleware
app.use(AuthRoute);
app.use(AdminRoute);
app.use(BahanBakuRoute);
app.use(ProdukRoute);
app.use("/uploads", express.static("uploads")); // Untuk melayani file gambar yang diunggah
app.use(uploadRoute);
app.use(RiwayatRoute);

store.sync();

app.listen(5000, () => {
  console.log("Server up and running...");
});
