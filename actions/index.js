"use strict";
const sessions = require("./sessions");
const users = require("./users");

module.exports = { ...sessions, ...users };
