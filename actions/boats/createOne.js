'use strict';

const Boat = require("../../schemas/Boat");
const pre = require("../../endpoints/pre");
const ResourceNotFoundException = require("../../errors/DefaultError");
const Enterprise = require("../../schemas/Enterprise");
const UniqueKeyViolationError = require("../../errors/mongo/UniqueKeyViolationError");
const CRUDOperationError = require("../../errors/mongo/CRUDOperationError");

const createOne = [
    pre.auth,
    pre.allow.moderator,
    pre.verifyInput(["mat", "name", "status", "enterprise"]),
    async (req, res, next) => {
        const { enterprise } = req.body;
        const enterprise_obj = await Enterprise.findOne({ _id: enterprise, active: true });
        if(!enterprise_obj) return res.status(404).json({
            error: new ResourceNotFoundException({
                message: "La empresa especificada no existe. "
            }).toJSON()
        }).end();
        else next();
    },
    async (req, res, next) => {
        const { mat } = req.body;
        const boat = await Boat.findOne({ mat, active: true });
        if(boat) return res.status(409).json({
            error: new UniqueKeyViolationError({
                message: "Ya existe una embarcación con la matrícula especificada. "
            }).toJSON()
        }).end();
        else next();
    },
    async (req, res) => {
        try {
            const { mat, name, status, enterprise } = req.body;
            const user = req.user._id;
            let reg = await Boat.create({
                mat,
                name,
                status,
                enterprise,
                user,
            });
            res.status(201).end();
        } catch (err) {
            console.log(err);
            res.status(500).json({
                error: new CRUDOperationError().toJSON()
            }).end();
        }
    }
];

module.exports = createOne;