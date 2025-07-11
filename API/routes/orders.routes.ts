import { Router } from "express";
import { verifyToken } from  "../middlewares/auth.middlewares";
import {getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder, getOrdersUsers} from "../controllers/orders.controller";
const router = Router();

router.get("/", verifyToken, getAllOrders);
router.get("/:id", verifyToken, getOrderById);
router.post("/", verifyToken, createOrder);
router.put("/:id", verifyToken, updateOrder);
router.delete("/:id", verifyToken, deleteOrder);
router.get("/user/:userId", verifyToken, getOrdersUsers);

export default router