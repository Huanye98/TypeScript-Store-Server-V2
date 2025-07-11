const PrintfulModel = require("../models/printful.model");
import { Request, Response, NextFunction } from "express";

const getPrintfulProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await PrintfulModel.getPrintfulProducts();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};
const getPrintfulProductDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id;
    console.log(productId)
    const productDetails = await PrintfulModel.getPrintfulProductDetails(productId);
    res.status(200).json(productDetails);
  } catch (error) {
    next(error);
  }
};

module.exports = { getPrintfulProducts, getPrintfulProductDetails };
