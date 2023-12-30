'use strict';
const Enterprise = require("../../../schemas/Enterprise");
const ResourceNotFoundError = require("../../../errors/resource/ResourceNotFoundError");
const CRUDOperationError = require("../../../errors/mongo/CRUDOperationError");
const list = async (req, res) => {
    try {
        const id = req.params.id;
        // Utiliza findOne para buscar un registro con ID y active: true
        const resource = await Enterprise.findOne({ _id: id, active: true });

        if (!resource) {
            return res.status(404).json({
                error: new ResourceNotFoundError().toJSON()
            });
        }

        const phones = resource.phones;
        return res.status(200).json({ phones });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: new CRUDOperationError().toJSON()
        });
    }
};
module.exports = list;