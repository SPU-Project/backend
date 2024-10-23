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

// route
const AuthRoute = require("./routes/AuthRoute.js");
const AdminRoute = require("./routes/AdminRoute.js");
const BahanBakuRoute = require("./routes/BahanBakuRoute.js");
const ProdukRoute = require("./routes/ProdukRoute.js");
const uploadRoute = require("./routes/uploadRoute.js"); // Import route baru

//Test Connection Cpanel
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionStore = SequelizeStore(session.Store);
const store = new sessionStore({
  db: db,
  expiration: 120 * 60 * 1000,
  checkExpirationInterval: 120 * 60 * 1000,
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

    console.log("Database synced...");
  } catch (error) {
    console.error("Unable to connect to the database or sync tables:", error);
  }
})();

app.use(
  session({
    secret: "jnfrfnmosumflieiajeoidf",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 120 * 60 * 1000,
      secure: "auto",
    },
  })
);

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

// Define your routes after middleware
app.use(AuthRoute);
app.use(AdminRoute);
app.use(BahanBakuRoute);
app.use(ProdukRoute);
app.use("/uploads", express.static("uploads")); // Untuk melayani file gambar yang diunggah
app.use(uploadRoute);

store.sync();

app.listen(5000, () => {
  console.log("Server up and running...");
});
