"use strict";
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const ValidationSchema = require("./Validation");

// TODO: Agregar endpoint para verificar si un horario está disponible en X condiciones / Condiciones del horario en cuestión.
const conditionOptions = [
	"MONDAY",
	"TUESDAY",
	"WEDNESDAY",
	"THURSDAY",
	"FRIDAY",
	"SATURDAY",
	"SUNDAY",
	"HOLIDAY",
	"HIGH_TIDE",
	"LOW_TIDE",
];

const requiredP = ["path", "condition", "available"];
const AvailabilitySchema = mongoose.Schema({
	path: {
		type: ObjectId,
		required: true,
		ref: "Path",
	},
	condition: {
		type: String,
		required: true,
		ref: "Path",
		minlength: 3,
		maxlength: 24,
	},
	available: {
		type: Boolean,
		required: true,
		default: true,
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
	validations: [ValidationSchema],
});
AvailabilitySchema.statics.validate = async function (
	resId,
	userId,
	validates
) {
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
module.exports = mongoose.model("Availability", AvailabilitySchema);
