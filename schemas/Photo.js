const fs = require("fs").promises; // Importar fs.promises para trabajar con promesas
const path = require("path");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Comment = require("./Comment");
const ValidationSchema = require("./Validation");

const photoSchema = mongoose.Schema({
	filename: {
		type: String,
		required: true,
	},
	user: {
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
	validations: [ValidationSchema],
});

// Definimos el método estático
photoSchema.statics.saveUploaded = async function (file, user, description) {
	console.log({ file, user, description });
	try {
		let pic = new this({
			filename: file.filename,
			user,
			description,
		});

		let pics = await pic.save();
		return pics._id;
	} catch (err) {
		console.log(err);
		throw new Error("Error saving photo");
	}
};
// En tu modelo Photo, agrega un método estático para obtener detalles de una imagen por su ID
photoSchema.statics.getPhotoDetailsById = async function (id) {
	try {
		const pic = await this.findOne({ _id: id, active: true });
		if (!pic) {
			return null;
		}
		const totalValidations = pic.validations.filter(
			(validation) => validation.validation === true
		).length;
		const totalInvalidations = pic.validations.filter(
			(validation) => validation.validation === false
		).length;
		return {
			url: `/photos/${id}/view`,
			user: pic.user, // Supongo que username es una propiedad en tu esquema
			description: pic.description,
			uploadDate: pic.uploadDate,
			validations: totalValidations,
			invalidations: totalInvalidations,
		};
	} catch (err) {
		console.error(err);
		throw new Error("Error fetching photo details");
	}
};

photoSchema.statics.comment = async function (photoId, content, userId) {
	try {
		// Crear el comentario y guardarlo
		const newComment = await Comment.create({
			user: userId,
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
photoSchema.statics.getValidations = async function (wbId, userId) {
	try {
		const aggregationResult = await this.aggregate([
			{ $match: { _id: new mongoose.Types.ObjectId(wbId) } },
			{
				$project: {
					validations: {
						$filter: {
							input: "$validations",
							as: "validation",
							cond: {
								$ne: ["$$validation.validation", null],
							},
						},
					},
				},
			},
			{
				$project: {
					inFavorCount: {
						$size: {
							$filter: {
								input: "$validations",
								as: "validation",
								cond: { $eq: ["$$validation.validation", true] },
							},
						},
					},
					againstCount: {
						$size: {
							$filter: {
								input: "$validations",
								as: "validation",
								cond: { $eq: ["$$validation.validation", false] },
							},
						},
					},
					userVote: {
						$cond: {
							if: {
								$ne: [
									{
										$indexOfArray: [
											"$validations.user",
											new mongoose.Types.ObjectId(userId),
										],
									},
									-1,
								],
							},
							then: {
								$cond: {
									if: {
										$eq: [
											"$validations.validation",
											true,
										],
									},
									then: true,
									else: false,
								},
							},
							else: null,
						},
					},
				},
			},
		]);

		if (aggregationResult.length === 0) {
			return {
				success: false,
				status: 404,
				message: "Resource not found",
			};
		}

		const { inFavorCount, againstCount, userVote } = aggregationResult[0];

		return {
			success: true,
			status: 200,
			message: "Validations retrieved",
			inFavorCount,
			againstCount,
			userVote,
		};
	} catch (error) {
		console.log(error);
		return {
			success: false,
			status: 500,
			message: "Could not retrieve validations",
		};
	}
};
photoSchema.statics.validate = async function (photoId, userId, validates) {
	try {
		const photo = await this.findById(photoId);
		if (!photo) {
			return {
				success: false,
				status: 404,
				message: "Photo not found",
			};
		}

		// Buscar si el usuario ya tiene una validación en esta foto
		const existingValidation = photo.validations.find((validation) => {
			return validation.user.toString() === user.toString();
		});

		if (existingValidation) {
			// Si ya existe una validación, actualizar su estado
			existingValidation.validation = validates;
		} else {
			// Si no existe, crear una nueva validación
			photo.validations.push({
				user: userId,
				validation: validates,
			});
		}

		await photo.save();

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

photoSchema.statics.deletePhotoById = async function (id) {
	try {
		const photo = await this.findById(id);

		if (!photo) {
			return {
				success: false,
				status: 404,
				message: "Photo not found",
			};
		}

		// Eliminar el archivo del sistema
		const filePath = path.join(
			__dirname,
			"../data/photos/",
			photo.filename
		);
		await fs.unlink(filePath);

		// Eliminar el registro en la base de datos
		await this.deleteOne({ _id: id });

		return {
			success: true,
			status: 200,
			message: "Photo deleted successfully",
		};
	} catch (error) {
		return {
			success: false,
			status: 500,
			message: "Could not delete photo",
		};
	}
};
module.exports = mongoose.model("Photo", photoSchema);
