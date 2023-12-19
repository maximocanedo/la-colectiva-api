"use strict";

const Availability = require("../../schemas/Availability");

const deleteOne = async (req, res) => {
	try {
		const { av_id } = req.params;
		const resource = await Availability.findOne({ _id: av_id });
		if (!resource) {
			return res.status(404).json({
				message: "Not found",
			});
		}
		res.active = false;
		await res.save();
		res.status(200).json({
			message: "Deleted",
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Internal error",
		});
	}
};

module.exports = deleteOne;
