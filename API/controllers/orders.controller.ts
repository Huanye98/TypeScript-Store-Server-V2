const Orders = require('../models/orders.model');
import { Request, Response, NextFunction } from 'express';


const getAllOrders = async (req: Request, res: Response, next: NextFunction):Promise<void>  => {
  try {
    const orders = await Orders.getAllOrders();
    res.status(200).json(orders);
    return 
  } catch (error) {
    next(error);
  }
}

const getOrderById = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  const orderId = req.params.id;
  try {
    const order = await Orders.getOrderById(orderId);
    if (!order) {
         res.status(404).json({ message: 'Order not found' });
      return
    }
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
}

const createOrder = async (req: Request, res: Response, next: NextFunction):Promise<void>  => {
  const orderData = req.body;
  try {
    const newOrder = await Orders.createOrder(orderData);
    res.status(201).json(newOrder);
    return
  } catch (error) {
    next(error);
  }
}

const updateOrder = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  const orderId = req.params.id;
  const orderData = req.body;
  try {
    const updatedOrder = await Orders.updateOrder(orderId, orderData);
    if (!updatedOrder) {
       res.status(404).json({ message: 'Order not found' });
       return
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
}

const deleteOrder = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  const orderId = req.params.id;
  try {
    const deletedOrder = await Orders.deleteOrder(orderId);
    if (!deletedOrder) {
       res.status(404).json({ message: 'Order not found' });
       return
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
}

const getOrdersUsers = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  const userId = req.params.userId;
  try {
    const orders = await Orders.getOrdersUsers(userId);
    if (!orders || orders.length === 0) {
      res.status(404).json({ message: 'No orders found for this user' });
      return 
    }
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
}


export {getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder, getOrdersUsers};