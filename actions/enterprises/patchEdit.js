'use strict';
const pre = require("../../endpoints/pre");
const Enterprise = require("../../schemas/Enterprise");
const patchEdit = [pre.auth, pre.allow.admin, async (req, res) => {
    try {
        const { id } = req.params; // Obtiene el ID del registro a actualizar
        const { name, cuit, description, foundationDate } = req.body; // Obtiene los campos a actualizar

        // Verifica si al menos uno de los campos está presente en la solicitud
        if (!name && !cuit && !description && !foundationDate) {
            return res.status(400).json({
                message: "Se requiere al menos un campo para actualizar.",
            });
        }

        const updatedFields = {}; // Almacena los campos actualizados dinámicamente

        // Actualiza solo los campos que se proporcionan en la solicitud
        if (name) updatedFields.name = name;
        if (cuit) updatedFields.cuit = cuit;
        if (description) updatedFields.description = description;
        if (foundationDate) updatedFields.foundationDate = foundationDate;

        // Busca y actualiza el registro en la base de datos
        const updatedEnterprise = await Enterprise.findByIdAndUpdate(
            id,
            { $set: updatedFields },
            { new: true }
        );

        if (!updatedEnterprise) {
            return res.status(404).json({
                message: "Registro no encontrado.",
            });
        }

        res.status(200).json({
            message: "Registro actualizado correctamente.",
            updatedEnterprise,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error interno del servidor.",
        });
    }
}];

module.exports = patchEdit;