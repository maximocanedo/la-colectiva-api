'use strict';
const Boat = require("../../schemas/Boat");
const getOne = async (req, res) => {
    try {
        const id = req.params.id;
        // Utiliza findOne para buscar un registro con ID y active: true
        let resource = await Boat.findOne({ _id: id, active: true, status: true }, {
            mat: 1,
            name: 1,
            status: 1,
            _id: 1,
            active: 1,
            enterprise: 1,
            user: 1,
            uploadDate: 1,
            pictures: 1
        })
            .populate("user", "name _id")
            .populate("enterprise", "name _id");

        if (!resource) {
            return res.status(404).end();
        }

        res.status(200).json({
            user: {
                name: resource.user.name,
                _id: resource.user._id,
            },
            mat: resource.mat,
            name: resource.name,
            enterprise: {
                _id: resource.enterprise._id,
                name: resource.enterprise.name,
            },
            status: resource.status,
            uploadDate: resource.uploadDate,
        });
    } catch (err) {
        console.error(err);
        res.status(500).end();
    }
};
module.exports = getOne;