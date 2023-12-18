'use strict';

const User = require("../../schemas/User");
const pre = require("../../endpoints/pre");

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, active: true });
        if (!user) {
            res.status(401).end();
        }
        const passwordMatch = await user.comparePassword(password);
        if (passwordMatch) {
            const uid = user._id.toString();
            const encrypted_uid = pre.encrypt(uid);
            res.cookie("userSession", encrypted_uid, { httpOnly: true, sameSite: 'None', secure: true });
            res.status(200).end();
        } else {
            res.status(401).end();
        }
    } catch (error) {
        console.error(error);
        res.status(500).end();
    }
};
const logout = async (req, res) => {
    try {
        res.clearCookie("userSession");
        res.status(200).end();
    } catch (err) {
        res.status(500).end();
    }
};

module.exports = {
    login,
    logout
};