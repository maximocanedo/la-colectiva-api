'use strict';
const getOne = require("./getOne");
const updatePassword = require("./updatePassword");
const updateRole = require("./updateRole");
const editPersonalInfo = require("./editPersonalInfo");
const deleteUser = require("./deleteUser");
const signup = require("./signup");
const { login, logout } = require("./auth");
const users = {
    getOne,
    updatePassword,
    updateRole,
    editPersonalInfo,
    deleteUser,
    signup,
    login,
    logout
};
module.exports = users;