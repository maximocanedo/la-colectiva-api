'use strict';
const pre = require("../../endpoints/pre");
const Path = require("../../schemas/Path");
const Boat = require("../../schemas/Boat");
const ResourceNotFoundError = require("../../errors/resource/ResourceNotFoundError");
const CRUDOperationError = require("../../errors/mongo/CRUDOperationError");
const createOne = [
    pre.auth,
    pre.allow.admin,
    pre.verifyInput(["boat", "title", "description", "notes"]),
    async (req, res, next) => {
        const { boat } = req.body;
        const obj = await Boat.findById(boat);
        if(!obj) return res.status(404).json({
            error: new ResourceNotFoundError().toJSON()
        }); else next();
    },
    async (req, res) => {
        try {
            const { boat, title, description, notes } = req.body;
            const userId = req.user._id;
            let reg = await Path.create({
                boat,
                user: userId,
                title,
                description,
                notes,
            });
            res.status(201).json({
                id: reg._id,
                message: "The file was successfully saved. ",
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                error: new CRUDOperationError().toJSON(),
            });
        }
    }
];
module.exports = createOne;