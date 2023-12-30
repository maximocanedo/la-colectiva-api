'use strict';
const pre = require("../../endpoints/pre");
const Enterprise = require("../../schemas/Enterprise");
const ResourceNotFoundError = require("../../errors/resource/ResourceNotFoundError");
const ExpropriationError = require("../../errors/user/ExpropriationError");
const CRUDOperationError = require("../../errors/mongo/CRUDOperationError");
const edit = [
    pre.auth,
    pre.allow.moderator,
    pre.verifyInput([
        "cuit",
        "name",
        "description",
        "foundationDate",
        "phones",
    ]),
    async (req, res) => {
        try {
            const id = req.params.id;
            const userId = req.user._id;
            const reg = await Enterprise.findOne({ _id: id, active: 1 });
            if (!reg) {
                res.status(404).json({
                    error: new ResourceNotFoundError().toJSON()
                }).end();
                return;
            }
            if (reg.user.toString() !== userId.toString()) {
                res.status(403).json({
                    error: new ExpropriationError().toJSON()
                });
                return;
            }
            const { cuit, name, description, foundationDate, phones } =
                req.body;
            reg.cuit = cuit;
            reg.name = name;
            reg.description = description;
            reg.foundationDate = foundationDate;
            reg.phones = phones;
            await reg.save();
            res.status(200).json({
                message: "Resource updated. ",
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                error: new CRUDOperationError().toJSON()
            });
        }
    }
];
module.exports = edit;