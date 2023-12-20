'use strict';
const Enterprise = require("../../../schemas/Enterprise");
const deleteOne = async (req, res) => {
    try {
        const id = req.params.id;
        const { phone } = req.body;
        // Utiliza findOne para buscar un registro con ID y active: true
        let resource = await Enterprise.findOne({ _id: id, active: true });

        if (!resource) {
            return res.status(404).json({
                message: "Resource not found",
            });
        }
        const result = await resource.deletePhone(phone);
        return res.status(result.status).json({msg: result.msg});

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal error",
        });
    }
};
module.exports = deleteOne;