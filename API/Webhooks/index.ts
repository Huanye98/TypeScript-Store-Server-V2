import { Request, Response } from "express";
import { Router } from "express";
const router = Router();
const printfulHandler = require("./printful");


router.post("/printful", (req:Request, res:Response) => {
  try {
    printfulHandler(req, res);
  } catch (error) {
    console.error("Error in Printful webhook handler:", error);
    res.status(400).json({ error: "Invalid json payload" });
  }
});


export default router;