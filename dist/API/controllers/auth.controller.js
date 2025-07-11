"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminData = exports.getUserData = void 0;
const getUserData = async (req, res, next) => {
    try {
        res.status(200).json({
            message: "User data retrieved",
            user: req.user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserData = getUserData;
const getAdminData = async (req, res, next) => {
    try {
        res.status(200).json({
            message: "Admin data retrieved",
            user: req.user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAdminData = getAdminData;
