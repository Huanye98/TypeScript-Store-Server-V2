"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const printfulHandler = require("./printful");
router.post("/printful", (req, res) => {
    try {
        printfulHandler(req, res);
    }
    catch (error) {
        console.error("Error in Printful webhook handler:", error);
        res.status(400).json({ error: "Invalid json payload" });
    }
});
exports.default = router;
