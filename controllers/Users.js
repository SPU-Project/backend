const Admin = require("../models/AdminModel.js");
const argon2 = require("argon2");

const getUser = async (req, res) => {
  try {
    const response = await Admin.findAll({
      attributes: ["id", "uuid", "email", "username", "role"],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    // Fetch the user by UUID from the request parameters
    const user = await Admin.findOne({
      attributes: ["id", "uuid", "email", "username", "role"],
      where: {
        id: req.params.id,
      },
    });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Return the user details
    res.status(200).json(user);
  } catch (error) {
    // Handle any errors that occur during the database query
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  const { email, password, confPassword, username, role } = req.body;
  // Log nilai req.body dan password
  console.log("Request Body:", req.body);
  console.log("Password:", password);
  console.log("ConfPassword:", confPassword);
  console.log("Role:", role);
  // Validasi bahwa password dan confPassword cocok
  if (password !== confPassword) {
    return res
      .status(400)
      .json({ msg: "Password dan konfirmasi password tidak cocok" });
  }
  // Periksa apakah username sudah ada
  // Check if email already exists
  const existingEmail = await Admin.findOne({ where: { email } });
  if (existingEmail) {
    return res
      .status(400)
      .json({ msg: "Email already exists, please choose another" });
  }

  // Check if username already exists
  const existingUsername = await Admin.findOne({ where: { username } });
  if (existingUsername) {
    return res
      .status(400)
      .json({ msg: "Username already exists, please choose another" });
  }
  const hashPassword = await argon2.hash(password);
  try {
    await Admin.create({
      email: email,
      password: hashPassword,
      username: username,
      role: role,
    });

    res.status(201).json({ msg: "Registration successful" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller function to update user
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await Admin.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) return res.status(404).json({ msg: "User not found" });

    const { email, password, confPassword, username, role } = req.body;

    // Log for debugging
    console.log("Request Body:", req.body);
    console.log("Password:", password);
    console.log("ConfPassword:", confPassword);

    // Check if username is new and unique
    if (username && username !== user.username) {
      const existingUser = await Admin.findOne({ where: { username } });
      if (existingUser) {
        return res
          .status(400)
          .json({ msg: "Username already exists, please choose another" });
      }
    }

    // Check if email is new and unique
    if (email && email !== user.email) {
      const existingEmail = await Admin.findOne({ where: { email } });
      if (existingEmail) {
        return res
          .status(400)
          .json({ msg: "Email already exists, please choose another" });
      }
    }

    // Handle password hashing
    let hashPassword;
    if (password === "" || password === null || password === undefined) {
      hashPassword = user.password;
    } else {
      if (password !== confPassword) {
        return res
          .status(400)
          .json({ msg: "Password and confirmation do not match" });
      }
      hashPassword = await argon2.hash(password);
    }

    // Update user record
    await Admin.update(
      {
        email: email,
        password: hashPassword,
        username: username,
        role: role,
      },
      {
        where: {
          id: user.id,
        },
      }
    );

    res.status(200).json({ msg: "User updated successfully" });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(400).json({ error: error.message });
  }
};

const deleteUserById = async (req, res) => {
  const user = await Admin.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (!user) return res.status(404).json({ msg: "User not found" });

  await Admin.destroy({
    where: {
      id: req.params.id,
    },
  });
  res.status(200).json({ msg: "User deleted successfully" });
};
module.exports = {
  getUser,
  getUserById,
  updateUser,
  createUser,
  deleteUserById,
};
