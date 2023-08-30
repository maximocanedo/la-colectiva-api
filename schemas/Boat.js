const mongoose = require("mongoose");
const Comment = require("./Comment");
const { ObjectId } = require("mongodb");
const ValidationSchema = require("./Validation");
let requiredProps = ["mat", "name", "status", "enterprise", "user"];
const boatSchema = mongoose.Schema({
	mat: {
		type: String,
		minlength: 2,
		maxlength: 16,
		required: false,
	},
	name: {
		type: String,
		maxlength: 48,
		minlength: 3,
		required: true,
	},
	status: {
		type: Boolean,
		required: true,
		default: true,
	},
	enterprise: {
		type: ObjectId,
		ref: "Enterprise",
	},
	user: {
		type: ObjectId,
		required: true,
		ref: "User",
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
	validations: [ValidationSchema],
	pictures: [
		{
			type: ObjectId,
			ref: "Photo",
		},
	],
});

boatSchema.statics.listData = async function (query, { page, itemsPerPage }) {
	try {
		const resource = await this.find(query)
			.sort({ name: 1 })
			.skip(page * itemsPerPage)
			.limit(itemsPerPage)
			.populate("user", "name _id")
			.populate("enterprise", "name _id")
			.exec();

		if (!resource) {
			return {
				items: [],
				status: 404,
				error: null,
				msg: "Resource not found.",
			};
		}

		return {
			items: resource,
			status: 200,
			error: null,
			msg: "OK",
		};
	} catch (err) {
		console.log(err);
		return {
			items: [],
			status: 500,
			error: err,
			msg: "Could not fetch the data.",
		};
	}
};
boatSchema.statics.comment = async function (resId, content, userId) {
	try {
		// Crear el comentario y guardarlo
		const newComment = await Comment.create({
			user: userId,
			content: content,
		});
		await this.updateOne(
			{ _id: resId },
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
boatSchema.statics.listComments = async function ({
	resId,
	page,
	itemsPerPage,
}) {
	try {
		const resource = await this.findById(resId)
			.select("comments")
			.populate({
				path: "comments",
				populate: {
					path: "user",
					model: "User",
					select: "name",
				},
				options: {
					sort: { uploadDate: 1 },
					skip: page * itemsPerPage,
					limit: itemsPerPage,
				},
			})
			.exec();

		if (!resource) {
			return {
				comments: [],
				status: 404,
				error: null,
				msg: "Resource not found.",
			};
		}

		return {
			comments: resource.comments,
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
boatSchema.statics.validate = async function (resId, userId, validates) {
	try {
		const resource = await this.findById(resId);
		if (!resource) {
			return {
				success: false,
				status: 404,
				message: "Resource not found",
			};
		}

		// Buscar si el usuario ya tiene una validación en este registro
		const existingValidation = resource.validations.find((validation) => {
			return validation.user.toString() === userId.toString();
		});

		if (existingValidation) {
			// Si ya existe una validación, actualizar su estado
			existingValidation.validation = validates;
		} else {
			// Si no existe, crear una nueva validación
			resource.validations.push({
				user: userId,
				validation: validates,
			});
		}

		await resource.save();

		return {
			success: true,
			status: 200,
			message: "Validation saved",
		};
	} catch (error) {
		return {
			success: false,
			status: 500,
			message: "Could not save validation",
		};
	}
};
boatSchema.statics.linkPhoto = async function (resId, picId) {
	try {
		// Crear el comentario y guardarlo
		const actualPhoto = await Photo.findOne({ _id: picId });
		if (!actualPhoto)
			return {
				status: 404,
			};
		const added = await this.updateOne(
			{ _id: resId },
			{ $push: { pictures: actualPhoto._id } }
		);
		return {
			status: 201,
		};
	} catch (error) {
		console.log(error);
		return {
			status: 500,
		};
	}
};
module.exports = mongoose.model("Boat", boatSchema);