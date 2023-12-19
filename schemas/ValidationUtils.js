'use strict';

const pre = require("../endpoints/pre");
const getValidations = (router, Model) => {
    router.get("/:id/votes", pre.auth, async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user._id;

            const result = await Model.getValidations(id, userId);

            if (!result.success) {
                console.error(result.message);
                return res.status(result.status).json(result);
            }

            res.status(result.status).json(result);
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal error",
            });
        }
    }); // Get validations
};
const vote = (router, Model) => {
    router.post(
        "/:id/votes/upvote",
        pre.auth,
        pre.allow.normal,
        async (req, res) => {
            try {
                const { id } = req.params;
                const userId = req.user._id;
                const validates = true;

                const result = await Model.validate(id, userId, validates);

                if (!result.success) {
                    console.error(result.message);
                    return res.status(result.status);
                }
                res.status(result.status);
            } catch (err) {
                console.error(err);
                res.status(500).end();
            }
        }
    ); // Upvote register
    router.post(
        "/:id/votes/downvote",
        pre.auth,
        pre.allow.normal,
        async (req, res) => {
            try {
                const { id } = req.params;
                const userId = req.user._id;
                const validates = false;

                const result = await Model.validate(id, userId, validates);

                if (!result.success) {
                    console.error(result.message);
                    return res.status(result.status);
                }
                res.status(result.status);
            } catch (err) {
                console.error(err);
                res.status(500).end();
            }
        }
    ); // Downvote register
};
const unvote = (router, Model) => {
    router.delete("/:id/votes", pre.auth, pre.allow.normal, async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user._id;

            const result = await Model.deleteValidation(userId, id);

            if (!result.success) {
                console.error(result.message);
                return res.status(result.status).json(result);
            }

            res.status(result.status).end();
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    });
};
const handleVotes = (router, Model) => {
    getValidations(router, Model);
    vote(router, Model);
    unvote(router, Model);
}

module.exports = {handleVotes};