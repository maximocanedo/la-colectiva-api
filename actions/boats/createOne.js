'use strict';

const Boat = require("../../schemas/Boat");
const pre = require("../../endpoints/pre");
const createOne = [
    pre.auth,
    pre.allow.moderator,
    pre.verifyInput(["mat", "name", "status", "enterprise"]),
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
            res.status(500).end();
        }
    }
];

module.exports = createOne;