'use strict';

const pre = require("../../endpoints/pre");
const Dock = require("../../schemas/Dock");
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
                message: "Internal error",
            });
        }
    }

];
module.exports = createOne;