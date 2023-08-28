"use strict";
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const ValidationSchema = mongoose.Schema({
	userId: {
		type: ObjectId,
		required: true,
		ref: "User",
	},
	uploadDate: {
		type: Date,
		required: true,
		default: Date.now(),
	},
	validation: {
		type: Boolean,
		required: true,
		default: true,
	},
});

module.exports = ValidationSchema;
