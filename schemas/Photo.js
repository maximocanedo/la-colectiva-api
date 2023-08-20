const mongoose = require("mongoose");
const { Comment, CommentSchema } = require("./CommentSchema");

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
	comments: [
		{
			type: CommentSchema,
		},
	],
});
photoSchema.statics.listComments = function ({ photoId, page, itemsPerPage }) {
	return this.findById(photoId)
		.select("comments")
		.populate({
			path: "comments",
			populate: {
				path: "userId", // Nombre del campo de referencia en el CommentSchema
				model: "User", // Nombre del modelo referenciado
				select: "name", // Seleccionar solo el campo de nombre de usuario
			},
			options: {
				sort: { uploadDate: 1 },
				skip: page * itemsPerPage,
				limit: itemsPerPage,
			},
		})
		.exec()
		.then((photo) => {
			if (!photo) {
				return {
					comments: [],
					status: 404,
					error: null,
					msg: "Photo not found.",
				};
			}

			return {
				comments: photo.comments,
				status: 200,
				error: null,
				msg: "",
			};
		})
		.catch((err) => {
			return {
				comments: [],
				status: 500,
				error: err,
				msg: "Could not fetch the comments.",
			};
		});
};

module.exports = mongoose.model("Photo", photoSchema);
