'use strict';

const pre = require("../../endpoints/pre");
const Enterprise = require("../../schemas/Enterprise");
const CRUDOperationError = require("../../errors/mongo/CRUDOperationError");
const ResourceNotFoundError = require("../../errors/resource/ResourceNotFoundError");
const UniqueKeyViolationError = require("../../errors/mongo/UniqueKeyViolationError");
const createOne = [
    pre.auth,
    pre.allow.admin,
    pre.verifyInput([
        "cuit",
        "name",
        "description",
        "foundationDate",
        "phones",
    ]),
    async (req, res, next) => {
        const { cuit } = req.body;
        const obj = await Enterprise.findOne({ cuit });
        if(!obj) next();
        else {
            res.status(400).json({
                error: new UniqueKeyViolationError().toJSON()
            }).end();
        }
    },
    async (req, res) => {
        try {
            const { cuit, name, description, foundationDate, phones } =
                req.body;
            const userId = req.user._id;
            let reg = await Enterprise.create({
                user: userId,
                cuit,
                name,
                description,
                foundationDate,
                phones,
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