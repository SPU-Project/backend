import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import db from "./config/Database.js";
import SequelizeStore from "connect-session-sequelize";
import Admin from "./models/AdminModel.js";
import BahanBakuModel from "./models/BahanBakuModel.js";
import KemasanModel from "./models/KemasanModel.js";
import OverheadModel from "./models/OverheadModel.js";
import ProdukBahanBakuModel from "./models/ProdukBahanBakuModel.js";
import ProdukModel from "./models/ProdukModel.js";
//route
import AuthRoute from "./routes/AuthRoute.js";
import AdminRoute from "./routes/AdminRoute.js";
import BahanBakuRoute from "./routes/BahanBakuRoute.js";
import ProdukRoute from "./routes/ProdukRoute.js";
import uploadRoute from "./routes/uploadRoute.js"; // Import route baru

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
    secret: process.env.SESS_SECRET,
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

app.listen(process.env.APP_PORT, () => {
  console.log("Server up and running...");
});
