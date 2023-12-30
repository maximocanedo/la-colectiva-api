'use strict';

const Enterprise = require("../../schemas/Enterprise");
const ExpropriationError = require("../../errors/user/ExpropriationError");
const ResourceNotFoundError = require("../../errors/resource/ResourceNotFoundError");
const getOne = async (req, res) => {
    try {
        const id = req.params.id;
        // Utiliza findOne para buscar un registro con ID y active: true
        let resource = await Enterprise.findOne({ _id: id, active: true });

        if (!resource) {
            return res.status(404).json({
                error: new ResourceNotFoundError().toJSON()
            });
        }
        const totalValidations = resource.validations.filter(
            (validation) => validation.validation === true
        ).length;
        const totalInvalidations = resource.validations.filter(
            (validation) => validation.validation === false
        ).length;

        const {
            _id,
            cuit,
            name,
            user,
            description,
            foundationDate,
            phones,
            active,
        } = resource;
        // Envía la imagen como respuesta
        res.status(200).json({
            _id,
            user,
            cuit,
            name,
            description,
            foundationDate,
            phones,
            active,
            validations: totalValidations,
            invalidations: totalInvalidations,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: new ExpropriationError().toJSON()
        });
    }
};
module.exports = getOne;