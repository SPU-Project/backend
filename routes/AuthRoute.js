const express = require("express");
const { Login, Logout, Me } = require("../controllers/Auth.js");
const sessionChecker = require("../middleware/sessionChecker.js");

const router = express.Router();

router.get("/me", sessionChecker, Me);
router.post("/login", Login);
router.delete("/logout", Logout);

module.exports = router;
