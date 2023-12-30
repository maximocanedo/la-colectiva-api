'use strict';

const User = require("../../schemas/User");
const jwt = require('jsonwebtoken');
const InvalidCredentials = require("../../errors/validation/InvalidCredentials");
const TokenGenerationError = require("../../errors/auth/TokenGenerationError");
require("dotenv").config();

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, active: true });
        if (!user) {
            res.status(401).json({
                error: new InvalidCredentials().toJSON()
            }).end();
            return;
        }
        const passwordMatch = await user.comparePassword(password);
        if (passwordMatch) {
            const token = jwt.sign({ user: user._id }, process.env.JWT_SECRET_KEY, {
                expiresIn: '24h',
            });
            res.header("Authorization", "Bearer " + token);
            res.status(200).json({token}).end();
        } else {
            res.status(401).json({
                error: new InvalidCredentials().toJSON()
            }).end();
        }
    } catch (error) {
        // TODO: Log error in separate file
        res.status(500).json({
            error: new TokenGenerationError().toJSON()
        }).end();
    }
};
const logout = async (req, res) => {
    res.status(405).end();
};

module.exports = {
    login,
    logout
};