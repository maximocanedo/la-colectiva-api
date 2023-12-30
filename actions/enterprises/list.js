'use strict';
const Enterprise = require("../../schemas/Enterprise");
const ResourceNotFoundError = require("../../errors/resource/ResourceNotFoundError");
const CRUDOperationError = require("../../errors/mongo/CRUDOperationError");
const list = async (req, res) => {
    try {
        // Utiliza find para buscar todos los registros con active: true
        let resources = await Enterprise.find({ active: true });

        if (!resources || resources.length === 0) {
            return res.status(404).json({
                error: new ResourceNotFoundError().toJSON()
            });
        }

        const responseData = resources.map((resource) => {
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

            return {
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
            };
        });

        // Envía los registros como respuesta
        res.status(200).json(responseData);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: new CRUDOperationError().toJSON()
        });
    }
};
module.exports = list;