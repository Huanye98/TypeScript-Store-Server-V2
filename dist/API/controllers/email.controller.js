"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const email_model_1 = require("../models/email.model");
const sendVerificationEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        await (0, email_model_1.sendVerificationEmailDB)(email);
        return res.status(200).json({ message: "Verification Email sent" });
    }
    catch (error) {
        next(error);
    }
};
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query;
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ message: "Invalid token" });
        }
        await (0, email_model_1.verifyEmailInDb)(token);
        return res.status(200).json({ message: "Email verified" });
    }
    catch (error) {
        next(error);
    }
};
const subscribeToNewsletter = async (req, res, next) => {
    try {
        const { email } = req.body;
        await (0, email_model_1.addEmailToNewsLetter)(email);
        return res.status(200).json({ message: "Subscribed to newsletter" });
    }
    catch (error) {
        next(error);
    }
};
const sendNewsletter = async (req, res, next) => {
    try {
        await (0, email_model_1.selectAndSendNewsletter)();
        return res.status(200).json({ message: "Newsletter sent" });
    }
    catch (error) {
        next(error);
    }
};
module.exports = {
    sendVerificationEmail,
    verifyEmail,
    subscribeToNewsletter,
    sendNewsletter,
};
