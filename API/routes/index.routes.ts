import { Request,Response, NextFunction } from "express";
const router = require("express").Router();

router.get("/", (req:Request, res:Response, next: NextFunction) => {
  res.json("All good in here");
});

import productRouter from "./products.routes"
router.use("/products", productRouter)

import usersRouter from "./users.routes"
router.use("/users", usersRouter)

import ordersRouter from "./orders.routes"
router.use("/orders", ordersRouter)

import authRouter from "./auth.routes"
router.use("/auth", authRouter)

import stripeRouter from "./stripe.routes"
router.use("/payment", stripeRouter)

// import cloudinaryRouter from "./cloudinary.routes"
// router.use("/upload",cloudinaryRouter)

import printfulRouter from "./printful.routes"
router.use("/printful", printfulRouter)

export default router;
