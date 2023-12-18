'use strict';
const User = require("../../schemas/User");
const signup = async (req, res) => {
    try {
        let { username, name, email, bio, birth, password } = req.body;
        const usernameIsAvailable = await User.isUsernameAvailable(
            username
        );
        if (!usernameIsAvailable) {
            res.status(409).end();
            return;
        }
        let m = null;
        if(email) m = email;
        const data = { username, name, bio, email: m, birth, password };
        // Validar datos.
        let newUser = new User(data);
        // Guardar.
        const savedStatus = await newUser.save();
        res.status(201).end();
    } catch (err) {
        console.error(err);
        res.status(500).end();
    }
};

module.exports = signup;