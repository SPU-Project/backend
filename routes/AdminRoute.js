const express = require("express");
const {
  getUser,
  getUserById,
  createUser,
  updateUser,
  deleteUserById,
} = require("../controllers/Users.js");

const router = express.Router();

router.get("/users", getUser);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUserById);

module.exports = router;
