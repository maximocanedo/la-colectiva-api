'use strict';
const pre = require("../../endpoints/pre");
const Path = require("../../schemas/Path");
const deleteOne = [pre.auth, async (req, res) => {
    try {
        const id = req.params.id;
        const resource = await Path.findById(id);
        const username = req.user._id;
        const isAdmin = req.user.role >= 3;
        if (!resource) {
            res.status(404).json({
                message: "There's no resource with the provided ID. ",
            });
            return;
        }
        if (resource.user != username && !isAdmin) {
            res.status(403).json({
                message: "No resource was deleted. ",
            });
            return;
        }
        resource.active = false;
        const status = await resource.save();
        res.status(200).json({
            message: "Data was disabled. ",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal error. ",
        });
    }
}];