"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Product = require("../models/Product.model");
const getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.queryAllProducts();
        res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
};
const getProducts = async (req, res, next) => {
    try {
        const filters = req.query;
        const products = await Product.getProducts(filters);
        res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
};
const getProductById = async (req, res, next) => {
    const { productId } = req.params;
    if (!productId) {
        return res.status(400).json({ message: "productId is required" });
    }
    try {
        const product = await Product.getProductById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    }
    catch (error) {
        next(error);
    }
};
const createProduct = async (req, res, next) => {
    const product = req.body;
    try {
        const newProduct = await Product.createProduct(product);
        res.status(201).json(newProduct);
    }
    catch (error) {
        next(error);
    }
};
const deleteProduct = async (req, res, next) => {
    const productId = req.params.productId;
    if (!productId) {
        return res.status(400).json({ message: "productId is required" });
    }
    try {
        const deletedProduct = await Product.findAndDeleteProduct(productId);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(201).json(deletedProduct);
    }
    catch (error) {
        next(error);
    }
};
const deleteVariant = async (req, res, next) => {
    const { variantId } = req.params;
    if (!variantId) {
        return res.status(400).json({ message: "VariantId is required" });
    }
    try {
        const deletedVariant = await Product.deleteVariant(variantId);
        if (!deletedVariant) {
            return res.status(404).json({ message: "Variant not found" });
        }
        res.status(200).json(deletedVariant);
    }
    catch (error) {
        next(error);
    }
};
const patchProduct = async (req, res, next) => {
    try {
        const updates = req.body;
        const { productId } = req.params;
        if (!productId || !updates) {
            return res
                .status(400)
                .json({ error: "Product ID and updates are required" });
        }
        const updateProduct = await Product.patchProductInDB(productId, updates);
        res.status(200).json(updateProduct);
    }
    catch (error) {
        next(error);
    }
};
const patchVariant = async (req, res, next) => {
    try {
        const updates = req.body;
        const { variantId } = req.params;
        if (!variantId) {
            return res
                .status(400)
                .json({ error: "Variant ID and updates are required" });
        }
        if (!updates) {
            return res
                .status(400)
                .json({ error: "Updates are required" });
        }
        const updatedVariant = await Product.patchVariant(variantId, updates);
        res.status(200).json(updatedVariant);
    }
    catch (error) {
        next(error);
    }
};
module.exports = {
    getProducts,
    createProduct,
    deleteProduct,
    deleteVariant,
    patchProduct,
    patchVariant,
    getAllProducts,
    getProductById
};
