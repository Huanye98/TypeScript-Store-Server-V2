"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = function authVerificationPrintful(req) {
    const authHeader = req.headers["authorization"];
    const apiToken = process.env.PRINTFUL_API_KEY;
    if (!authHeader || !apiToken) {
        return false;
    }
    const token = authHeader.replace("Bearer ", "");
    return token === apiToken;
};
