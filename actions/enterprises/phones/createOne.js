'use strict';
const Enterprise = require("../../../schemas/Enterprise");
const ResourceNotFoundError = require("../../../errors/resource/ResourceNotFoundError");
const CRUDOperationError = require("../../../errors/mongo/CRUDOperationError");
const createOne = async (req, res) => {
    try {
        const id = req.params.id;
        const { phone } = req.body;
        // Utiliza findOne para buscar un registro con ID y active: true
        let resource = await Enterprise.findOne({ _id: id, active: true });

        if (!resource) {
            return res.status(404).json({
                error: new ResourceNotFoundError().toJSON()
            });
        }
        const result = await resource.addPhone(phone);
        return res.status(result.status).json({msg: result.msg});

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: new CRUDOperationError().toJSON()
        });
    }
};
module.exports = createOne;