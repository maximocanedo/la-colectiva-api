"use strict";

const Availability = require("../../schemas/Availability");

const createOne = async (req, res) => {
	try {
		let { av_id } = req.params;
		let resource = await Availability.findOne(
			{
				_id: av_id,
				active: true,
			},
			{
				validations: 0,
			}
		)
			.populate("user", "_id name")
			.populate("path", "_id title");
		if (!resource) {
			return res.status(404).end();
		}
		res.status(200).json(resource);
	} catch (err) {
		res.status(500).end();
	}
};

module.exports = createOne;
