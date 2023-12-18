'use strict';

const User = require("../../schemas/User");
const deleteUser = (me = false) => (async (req, res) => {
    try {
        const { username } = me ? req.user : req.params;
        let user = await User.findOne({ username, active: true }, { password: 0 });
        if (!user) {
            res.status(404).end();
        }
        user.active = false;
        let savedStatus = await user.save();
        res.status(200).end();
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

module.exports = deleteUser;