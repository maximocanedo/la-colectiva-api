const mongoose = require("mongoose");
const Comment = require("./Comment");
const { ObjectId } = require("mongodb");

const photoSchema = mongoose.Schema({
	filename: {
		type: String,
		required: true,
	},
	userId: {
		type: ObjectId,
		required: true,
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
	comments: [
		{
			type: ObjectId,
			ref: "Comment",
		},
	],
});

photoSchema.statics.comment = async function (photoId, content, userId) {
	try {
		// Crear el comentario y guardarlo
		const newComment = await Comment.create({
			userId: userId,
			content: content,
		});

		// Agregar el ObjectId del comentario al arreglo de comentarios de la foto
		await this.updateOne(
			{ _id: photoId },
			{ $push: { comments: newComment._id } }
		);

		return {
			newComment,
			status: 201,
		};
	} catch (error) {
		throw error;
	}
};

photoSchema.statics.listComments = async function ({
	photoId,
	page,
	itemsPerPage,
}) {
	try {
		const photo = await this.findById(photoId)
			.select("comments")
			.populate({
				path: "comments",
				populate: {
					path: "userId",
					model: "User",
					select: "name", // Cambia "name" a "fullName" si ese es el campo de nombre completo en tu modelo de usuario
				},
				options: {
					sort: { uploadDate: 1 },
					skip: page * itemsPerPage,
					limit: itemsPerPage,
				},
			})
			.exec();

		if (!photo) {
			return {
				comments: [],
				status: 404,
				error: null,
				msg: "Photo not found.",
			};
		}

		/*const formattedComments = photo.comments.map((comment) => ({
			content: comment.content,
			userName: comment.userId.fullName, // Cambia a "name" si estás utilizando "name" en tu modelo de usuario
		}));*/

		return {
			comments: photo.comments,
			status: 200,
			error: null,
			msg: "",
		};
	} catch (err) {
		return {
			comments: [],
			status: 500,
			error: err,
			msg: "Could not fetch the comments.",
		};
	}
};

module.exports = mongoose.model("Photo", photoSchema);
