"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PrintfulModel = require("../models/printful.model");
const getPrintfulProducts = async (req, res, next) => {
    try {
        const products = await PrintfulModel.getPrintfulProducts();
        res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
};
const getPrintfulProductDetails = async (req, res, next) => {
    try {
        const productId = req.params.id;
        console.log(productId);
        const productDetails = await PrintfulModel.getPrintfulProductDetails(productId);
        res.status(200).json(productDetails);
    }
    catch (error) {
        next(error);
    }
};
module.exports = { getPrintfulProducts, getPrintfulProductDetails };
