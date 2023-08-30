"use strict";
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const CommentSchema = mongoose.Schema({
	user: {
		type: ObjectId,
		required: true,
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
CommentSchema.statics.add = async function (userId, content) {
	try {
		const newComment = await this.create({
			user: userId,
			content: content,
		});
		return newComment;
	} catch (error) {
		throw error;
	}
};
CommentSchema.statics.delete = async function (commentId) {
	try {
		const comment = await this.findById(commentId);
		if (!comment) {
			return {
				success: false,
				status: 404,
				message: "Comment not found",
			};
		}
		comment.active = false;
		await comment.save();

		return {
			success: true,
			status: 200,
			message: "Comment deleted",
		};
	} catch (error) {
		console.log(error);
		return {
			success: false,
			status: 500,
			message: "Could not delete comment",
		};
	}
};

module.exports = mongoose.model("Comment", CommentSchema);