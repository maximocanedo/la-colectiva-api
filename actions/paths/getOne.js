'use strict';
const Path = require("../../schemas/Path");
const getOne = [async (req, res) => {
    try {
        const id = req.params.id;
        // Utiliza findOne para buscar un registro con ID y active: true
        let resource = await Path.findOne({ _id: id, active: true })
            .populate("user", "name _id")
            .populate("boat", "name _id");

        if (!resource) {
            return res.status(404).json({
                message: "Resource not found",
            });
        }
        const totalValidations = resource.validations.filter(
            (validation) => validation.validation === true
        ).length;
        const totalInvalidations = resource.validations.filter(
            (validation) => validation.validation === false
        ).length;

        const { user, boat, title, description, notes } = resource;
        // Envía la imagen como respuesta
        res.status(200).json({
            user,
            boat,
            title,
            description,
            notes,
            validations: totalValidations,
            invalidations: totalInvalidations,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal error",
        });
    }
}];
module.exports = getOne;