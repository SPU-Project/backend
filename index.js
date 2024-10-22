import express from "express";
import cors from "cors";
import session from "express-session";
import db from "./config/Database.js";
import SequelizeStore from "connect-session-sequelize";
import Admin from "./models/AdminModel.js";
import BahanBakuModel from "./models/BahanBakuModel.js";
import KemasanModel from "./models/KemasanModel.js";
import OverheadModel from "./models/OverheadModel.js";
import ProdukBahanBakuModel from "./models/ProdukBahanBakuModel.js";
import ProdukModel from "./models/ProdukModel.js";
import http from "http";

//route
import AuthRoute from "./routes/AuthRoute.js";
import AdminRoute from "./routes/AdminRoute.js";
import BahanBakuRoute from "./routes/BahanBakuRoute.js";
import ProdukRoute from "./routes/ProdukRoute.js";
import uploadRoute from "./routes/uploadRoute.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionStore = SequelizeStore(session.Store);
const store = new sessionStore({
  db: db,
  expiration: 120 * 60 * 1000,
  checkExpirationInterval: 120 * 60 * 1000,
});

// Database initialization
(async function () {
  try {
    await db.authenticate();
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

// Session middleware
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

// CORS middleware
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

// Basic route untuk pengecekan server
app.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  const message = "It works!\n";
  const version = "NodeJS " + process.versions.node + "\n";
  const response = [message, version].join("\n");
  res.end(response);
});

// Routes
app.use(AuthRoute);
app.use(AdminRoute);
app.use(BahanBakuRoute);
app.use(ProdukRoute);
app.use("/uploads", express.static("uploads"));
app.use(uploadRoute);

// Sync session store
store.sync();

// Create HTTP server
const server = http.createServer(app);

// Error handling
server.on("error", (error) => {
  console.error("Server error:", error);
  if (error.syscall !== "listen") {
    throw error;
  }
  throw error;
});

// Start server
server.listen(5000, () => {
  console.log("Server up and running on port 5000...");
});
