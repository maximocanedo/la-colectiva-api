const mongoose = require("mongoose");

const photoSchema = mongoose.Schema({
	filename: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		required: true,
		match: /^[a-zA-Z0-9_]{3,16}$/,
		ref: "User",
	},
	description: {
		type: String,
		required: false,
		maxlength: 256,
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
module.exports = mongoose.model("Photo", photoSchema);
