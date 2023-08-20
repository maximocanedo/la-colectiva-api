"use strict";
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const CommentSchema = mongoose.Schema({
	userId: {
		type: ObjectId,
		required: true,
		ref: "User",
	},
	username: {
		type: String,
		required: true,
		match: /^[a-zA-Z0-9_]{3,16}$/,
		ref: "User",
	},
	content: {
		type: String,
		required: true,
		maxlength: 256,
		minlength: 1,
	},
	uploadDate: {
		type: Date,
		required: true,
		default: Date.now(),
	},
	active: {
		type: Boolean,
		required: true,
		default: true,
	},
});

module.exports = {
	CommentSchema,
	Comment: mongoose.model("Comment", CommentSchema),
};
