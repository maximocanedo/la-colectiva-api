'use strict';

const User = require("../../schemas/User");
const updatePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { password } = req.body;

        // Buscar el usuario completo por su ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404);
        }

        user.password = password;
        const updatedUser = await user.save();

        res.status(200);
    } catch (err) {
        console.error(err);
        res.status(500);
    }
};

module.exports = updatePassword;