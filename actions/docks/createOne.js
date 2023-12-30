'use strict';

const pre = require("../../endpoints/pre");
const Dock = require("../../schemas/Dock");
const CRUDOperationError = require("../../errors/mongo/CRUDOperationError");
const WaterBody = require("../../schemas/WaterBody");
const ResourceNotFoundError = require("../../errors/resource/ResourceNotFoundError");

const createOne = [
    pre.auth,
    pre.allow.moderator,
    pre.verifyInput([
        "name",
        "address",
        "region",
        "notes",
        "status",
        "latitude",
        "longitude",
    ]),
    async (req, res, next) => {
        const { region } = req.body;
        const obj = await WaterBody.findOne({ _id: region, active: true });
        if (!obj) {
            return res.status(400).json({
                error: new ResourceNotFoundError().toJSON()
            });
        } else next();
    },
    async (req, res) => {
        try {
            const {
                name,
                address,
                region,
                notes,
                status,
                latitude,
                longitude,
            } = req.body;
            const user = req.user._id;
            let reg = await Dock.create({
                user,
                name,
                address,
                region,
                notes,
                status,
                coordinates: [latitude, longitude],
            });
            res.status(201).json({
                id: reg._id,
                message: "The file was successfully saved. ",
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                error: new CRUDOperationError().toJSON()
            });
        }
    }

];
module.exports = createOne;