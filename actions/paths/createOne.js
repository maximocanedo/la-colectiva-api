'use strict';
const pre = require("../../endpoints/pre");
const Path = require("../../schemas/Path");
const createOne = [
    pre.auth,
    pre.allow.admin,
    pre.verifyInput(["boat", "title", "description", "notes"]),
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
                message: "Internal error",
            });
        }
    }
];
module.exports = createOne;