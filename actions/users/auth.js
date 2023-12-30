'use strict';

const User = require("../../schemas/User");
const pre = require("../../endpoints/pre");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, active: true });
        if (!user) {
            res.status(401).end();
        }
        const passwordMatch = await user.comparePassword(password);
        if (passwordMatch) {
            const uid = user._id.toString(); // User ID
            const encrypted_uid = pre.encrypt(uid);
            const token = jwt.sign({ user: user._id }, process.env.JWT_SECRET_KEY, {
                expiresIn: '24h',
            });
            res.header("Authorization", "Bearer " + token);
            res.status(200).json({token}).end();
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