'use strict';
const Path = require("../../schemas/Path");
const list = [async (req, res) => {
    try {
        // Cambia findOne por find para obtener todos los registros con active: true
        let resources = await Path.find({ active: true })
            .populate("user", "name _id")
            .populate("boat", "name _id");

        if (!resources || resources.length === 0) {
            return res.status(404).json({
                message: "Resources not found",
            });
        }

        // Mapea los recursos para obtener los datos que necesitas de cada uno
        const formattedResources = resources.map((resource) => {
            const totalValidations = resource.validations.filter(
                (validation) => validation.validation === true
            ).length;
            const totalInvalidations = resource.validations.filter(
                (validation) => validation.validation === false
            ).length;

            const { user, boat, title, description, notes, _id } = resource;

            return {
                _id,
                user,
                boat,
                title,
                description,
                notes,
                validations: totalValidations,
                invalidations: totalInvalidations,
            };
        });

        // Envía la lista de recursos como respuesta
        res.status(200).json(formattedResources);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal error",
        });
    }
}];
module.exports = list;