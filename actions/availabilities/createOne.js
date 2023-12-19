"use strict";

const Availability = require("../../schemas/Availability");

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
		res.status(500).end();
	}
};

module.exports = createOne;
