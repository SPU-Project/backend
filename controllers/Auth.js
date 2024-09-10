import Admin from "../models/AdminModel.js";
import argon2 from "argon2";

export const Login = async (req, res) => {
    const user = await Admin.findOne({
        where: {
            email: req.body.email

        }
    });
    if(!user) return res.status(404).json({msg: "User not found"});
    const match = await argon2.verify(user.password, req.body.password);
    if(!match) return res.status(400).json({msg: "Wrong password"});
    req.session.userId= user.uuid;
    console.log('Session User ID:', req.session.userId);  // Add this line
    const uuid = user.uuid;
    const email = user.email;
    const username = user.username;
    res.status(200).json({msg: "Login success", uuid, email, username});
}

export const Me = async (req, res) => {
    console.log('Session in /me route:', req.session);  // Log session details

    if (!req.session.userId) 
        return res.status(401).json({ msg: "Please log in to your account" });

    try {
        const user = await Admin.findOne({
            attributes: ['uuid', 'email', 'username',],
            where: {
                uuid: req.session.userId
            }
        });
        if (!user) return res.status(404).json({ msg: "User not found" });

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
};


export const Logout = (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ msg: "User not logged in" });
    }

    req.session.destroy((err) => {
        if (err) {
            return res.status(400).json({ msg: "Logout failed" });
        }
        res.clearCookie("connect.sid");
        res.status(200).json({ msg: "Logout success" });
    });
}


