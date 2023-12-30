"use strict";

const Availability = require("../../schemas/Availability");
const ValidationError = require("../../errors/validation/ValidationError");
const UniqueKeyViolationError = require("../../errors/mongo/UniqueKeyViolationError");
const DefaultError = require("../../errors/DefaultError");

const createOne = async (req, res) => {
	try {
		const { path, condition, available } = req.body;
		const user = req.user._id;
		// Utilizar el método add para crear el comentario
		const newResource = await Availability.create({
			path,
			condition,
			available,
			user,
		});
		res.status(201).end();
	} catch (err) {
		switch(err.name) {
			case 'ValidationError':
				res.status(400).json({ error: new ValidationError().toJSON() });
				break;
			case 'MongoError':
				res.status(409).json({ error: new UniqueKeyViolationError().toJSON() });
				break;
			default:
				res.status(500).json({ error: new DefaultError().toJSON() });
		}
		res.end();
	}
};

module.exports = createOne;
