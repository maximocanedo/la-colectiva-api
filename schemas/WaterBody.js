const mongoose = require("mongoose");
const Comment = require("./Comment");
const { ObjectId } = require("mongodb");
const ValidationSchema = require("./Validation");

const WATERBODY_TYPE = {
	RIVER: 0, // Río
	STREAM: 1, // Arroyo
	BROOK: 2, // Riachuelo
	CANAL: 3, // Canal
	LAKE: 4, // Lago
	POND: 5, // Estanque
	LAGOON: 6, // Laguna
	RESERVOIR: 7, // Embalse
	SWAMP: 8, // Pantano
	WELL: 9, // Pozo
	AQUIFER: 10, // Acuífero
	BAY: 11, // Bahía
	GULF: 12, // Golfo
	SEA: 13, // Mar
	OCEAN: 14, // Océano
};

const waterBodySchema = mongoose.Schema({
	name: {
		type: String,
		maxlength: 48,
		minlength: 3,
		required: true,
	},
	user: {
		type: ObjectId,
		required: true,
		ref: "User",
	},
	type: {
		type: Number,
		required: true,
		// Validar alcance
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
});

waterBodySchema.statics.comment = async function (wbId, content, userId) {
	try {
		// Crear el comentario y guardarlo
		const newComment = await Comment.create({
			user: userId,
			content: content,
		});
		await this.updateOne(
			{ _id: wbId },
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
waterBodySchema.statics.listComments = async function ({
	wbId,
	page,
	itemsPerPage,
}) {
	try {
		const resource = await this.findById(wbId)
			.select("comments")
			.populate({
				path: "comments",
				populate: {
					path: "user",
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
waterBodySchema.statics.validate = async function (wbId, userId, validates) {
	try {
		const resource = await this.findById(wbId);
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

module.exports = mongoose.model("WaterBody", waterBodySchema);
