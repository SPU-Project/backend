const Admin = require("../models/AdminModel.js");
const argon2 = require("argon2");

const Login = async (req, res) => {
  try {
    // Mencari pengguna berdasarkan email yang diberikan
    const user = await Admin.findOne({
      where: {
        email: req.body.email,
      },
    });

    // Jika pengguna tidak ditemukan, kirim respons 404
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Verifikasi password yang diberikan dengan hash yang tersimpan
    const match = await argon2.verify(user.password, req.body.password);

    // Jika password tidak cocok, kirim respons 400
    if (!match) return res.status(400).json({ msg: "Wrong password" });

    // Jika password cocok, buat sesi dan simpan user ID dalam sesi
    req.session.userId = user.id;
    console.log("Session User ID:", req.session.userId); // Log ID pengguna yang disimpan di sesi

    // Kirim respons sukses dengan data pengguna
    const uuid = user.uuid;
    const email = user.email;
    const username = user.username;
    res.status(200).json({ msg: "Login success", uuid, email, username });
  } catch (error) {
    // Tangani kesalahan internal server
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
      attributes: ["uuid", "email", "username"],
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

const Logout = (req, res) => {
  if (!req.session.userId) {
    console.log("Logout attempt without a valid session"); // Log saat tidak ada sesi yang valid
    return res.status(401).json({ msg: "User not logged in" });
  }

  req.session.destroy((err) => {
    if (err) {
      console.log("Error destroying session:", err); // Log jika terjadi kesalahan saat menghancurkan sesi
      return res.status(400).json({ msg: "Logout failed" });
    }

    // Cek apakah sesi benar-benar terhapus
    if (!req.session) {
      console.log("Session has been successfully destroyed."); // Log jika sesi terhapus
    } else {
      console.log("Session still exists:", req.session); // Log jika sesi masih ada (ini seharusnya tidak terjadi)
    }

    res.clearCookie("connect.sid");
    console.log("Session destroyed and cookie cleared"); // Log saat sesi dihancurkan dan cookie dihapus
    res.status(200).json({ msg: "Logout success" });
  });
};

module.exports = { Login, Me, Logout };
