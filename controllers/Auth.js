const Admin = require("../models/AdminModel.js");
const argon2 = require("argon2");
const RiwayatLog = require("../models/RiwayatLog.js");

const Login = async (req, res) => {
  try {
    // Find the user by email
    const user = await Admin.findOne({
      where: {
        email: req.body.email,
      },
    });

    // If user not found, send 404 response
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Verify the password
    const match = await argon2.verify(user.password, req.body.password);

    // If password does not match, send 400 response
    if (!match) return res.status(400).json({ msg: "Wrong password" });

    // Set the session userId
    req.session.userId = user.id;
    console.log("Session User ID:", req.session.userId);

    // Create a log entry in RiwayatLog
    try {
      await RiwayatLog.create({
        username: user.username,
        role: user.role,
        description: "User logged in",
      });
    } catch (error) {
      console.error("Error creating log entry:", error);
      // You can choose to handle this error or proceed
    }

    // Send success response with user data
    const uuid = user.uuid;
    const email = user.email;
    const username = user.username;
    const role = user.role;
    res.status(200).json({ msg: "Login success", uuid, email, username, role });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const Me = async (req, res) => {
  console.log("Session in /me route:", req.session.userId); // Log session details

  if (!req.session.userId)
    return res.status(401).json({ msg: "Please log in to your account" });

  try {
    const user = await Admin.findOne({
      attributes: ["uuid", "email", "username", "role"],
      where: {
        id: req.session.userId,
      },
    });
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal server error", error: error.message });
  }
};

const Logout = async (req, res) => {
  if (!req.session.userId) {
    console.log("Logout attempt without a valid session");
    return res.status(401).json({ msg: "User not logged in" });
  }

  // Get user information before destroying the session
  const user = await Admin.findOne({
    where: { id: req.session.userId },
    attributes: ["username", "role"],
  });

  // Function to destroy the session using a Promise
  const destroySession = () =>
    new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

  try {
    // Destroy the session
    await destroySession();
    res.clearCookie("connect.sid");
    console.log("Session destroyed and cookie cleared");

    // Create a log entry in RiwayatLog
    try {
      await RiwayatLog.create({
        username: user.username,
        role: user.role,
        description: "User logged out",
      });
    } catch (error) {
      console.error("Error creating log entry:", error);
      // You can choose to handle this error or proceed
    }

    // Send success response
    res.status(200).json({ msg: "Logout success" });
  } catch (err) {
    console.log("Error destroying session:", err);
    return res.status(400).json({ msg: "Logout failed" });
  }
};

module.exports = { Login, Me, Logout };
