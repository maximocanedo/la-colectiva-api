'use strict';

const Dock = require("../../schemas/Dock");
const CRUDOperationError = require("../../errors/mongo/CRUDOperationError");
const ResourceNotFoundError = require("../../errors/resource/ResourceNotFoundError");
const getOne = async (req, res) => {
    try {
        const id = req.params.id;
        // Utiliza findOne para buscar un registro con ID y active: true
        let resource = await Dock.findOne({ _id: id, active: true })
            .populate("user", "name _id")
            .populate("region", "name type");

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

        res.status(200).json({
            user: {
                name: resource.user.name,
                _id: resource.user._id,
            },
            name: resource.name,
            address: resource.address,
            region: {
                _id: resource.region._id,
                name: resource.region.name,
                type: resource.region.type,
            },
            notes: resource.notes,
            status: resource.status,
            uploadDate: resource.uploadDate,
            coordinates: resource.coordinates,
            validations: totalValidations,
            invalidations: totalInvalidations,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: new CRUDOperationError().toJSON()
        });
    }
};
module.exports = getOne;