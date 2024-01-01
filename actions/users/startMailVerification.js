'use strict';
const MailVerification = require("../../schemas/MailVerification");
const pre = require("../../endpoints/pre");
const crypto = require("crypto");

const startMailVerification = [
    pre.auth,
    // Validar mail.
    async (req, res) => {
        try {
            let randomNumSixDigits = Math.floor(Math.random() * 1000000);
            let hash = crypto.createHash('sha256').update(randomNumSixDigits.toString()).digest('hex');

            let data = {
                code: hash,
                user: req.user._id,
                mail: req.body.mail,
                expirationDate: Date.now() + 1000 * 60 * 60 * 24,
                active: false
            };

            let mailVerification = new MailVerification(data);
            const result = await mailVerification.save();
            res.status(201).json({ validationId: result._id, __code$: randomNumSixDigits }).end();
        } catch(err) {
            console.error(err);
            res.status(500).end();
        }
    }
];

const validateMail = [
    pre.auth,
    async (req, res) => {
        const { code } = req.body;
        const { validationId } = req.params;
        const mailVerification = await MailVerification.findOne({ _id: validationId, active: false });
        if (!mailVerification) {
            res.status(404).end();
            return;
        }
        const hash = crypto.createHash('sha256').update(code.toString()).digest('hex');
        if (hash !== mailVerification.code) {
            res.status(401).end();
        } else {
            mailVerification.active = true;
            await mailVerification.save();
            res.status(204).end();

        }
    }
]

module.exports = {startMailVerification, validateMail};