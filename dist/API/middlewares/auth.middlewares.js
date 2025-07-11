"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleValidation = exports.verifyToken = void 0;
const jwt = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ errorMessage: "Token is missing" });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ errorMessage: "Invalid or expired token" });
        return;
    }
};
exports.verifyToken = verifyToken;
const roleValidation = (requiredRole) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res
                .status(401)
                .json({ errorMessage: "no req.user" });
        }
        if (user?.role !== requiredRole) {
            return res
                .status(401)
                .json({ errorMessage: "Access denied, not enough clearance" });
        }
        next();
    };
};
exports.roleValidation = roleValidation;
