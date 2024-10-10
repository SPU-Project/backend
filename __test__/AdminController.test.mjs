// AdminController.test.mjs
import assert from "assert";
import { Login, Me, Logout } from "../controllers/Auth.js";
import Admin from "../models/AdminModel.js";
import argon2 from "argon2";

// Mock req, res, dan Admin model
const req = {
  body: {
    email: "test@example.com",
    password: "password123",
  },
  session: {},
};

const res = {
  status: function (statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  json: function (data) {
    this.jsonData = data;
    return this;
  },
  clearCookie: function (name) {
    this.clearedCookie = name;
  },
};

// ...

describe("Login", () => {
  // ...

  it("should return 400 if password is incorrect", async () => {
    Admin.findOne = async () => ({ password: "hashedPassword" });
    argon2.verify = async () => false;

    await Login(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.deepStrictEqual(res.jsonData, { msg: "Wrong password" });
  });

  it("should return 200 and user data on successful login", async () => {
    const user = {
      id: 1,
      uuid: "user-uuid",
      email: "test@example.com",
      username: "testuser",
      password: "hashedPassword",
    };
    Admin.findOne = async () => user;
    argon2.verify = async () => true;

    await Login(req, res);

    assert.strictEqual(req.session.userId, user.id);
    assert.strictEqual(res.statusCode, 200);
    assert.deepStrictEqual(res.jsonData, {
      msg: "Login success",
      uuid: user.uuid,
      email: user.email,
      username: user.username,
    });
  });

  // ...
});

// ...

describe("Logout", () => {
  // ...

  it("should return 200 and clear session on successful logout", () => {
    req.session.userId = 1;
    req.session.destroy = (callback) => callback();

    Logout(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.clearedCookie, "connect.sid");
    assert.deepStrictEqual(res.jsonData, { msg: "Logout success" });
  });
});
