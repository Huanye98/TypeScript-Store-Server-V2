import { Request, Response } from "express";

const authVerificationPrintful = require("./services/authVerificationPrintful");
const productUpdated = require("./handlers/productUpdated");
const productDeleted = require("./handlers/productDeleted");
const productCreated = require("./handlers/productCreated");

module.exports = async (req:Request, res:Response) => {
  const isValid = authVerificationPrintful(req);
  if (!isValid) {
    return res.status(403).send("invalid signature");
  }

  const { type, data } = req.body;
  try {
    switch (type) {
      case "product_updated":
        await productUpdated(data);
        res.sendStatus(200);
        break;
      case "product_deleted":
        await productDeleted(data);
        res.sendStatus(200);
        break;
      case "product_created":
        await productCreated(data);
        res.sendStatus(200);
        break;
      default:
        console.log("Unhandled event type:", type);
        res.sendStatus(200);
    }
  } catch (error) {
    console.error("Error handling Printful webhook:", error);
    res.sendStatus(500);
  }
};
