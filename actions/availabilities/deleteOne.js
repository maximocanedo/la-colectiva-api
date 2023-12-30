"use strict";

const Availability = require("../../schemas/Availability");
const ResourceNotFoundError = require("../../errors/resource/ResourceNotFoundError");
const DeleteOperationError = require("../../errors/mongo/DeleteOperationError");

const deleteOne = async (req, res) => {
	try {
		const { av_id } = req.params;
		const resource = await Availability.findOne({ _id: av_id });
		if (!resource) {
			return res.status(404).json({
				error: new ResourceNotFoundError().toJSON(),
			}).end();
		}
		res.active = false;
		await res.save();
		res.status(200).json({
			message: "Deleted",
		}).end();
	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: new DeleteOperationError().toJSON()
		}).end();
	}
};

module.exports = deleteOne;
