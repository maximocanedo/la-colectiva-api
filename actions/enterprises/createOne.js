'use strict';

const pre = require("../../endpoints/pre");
const Enterprise = require("../../schemas/Enterprise");
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
                message: "Internal error",
            });
        }
    }
];
module.exports = createOne;