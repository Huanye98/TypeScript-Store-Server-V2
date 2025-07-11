"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersUsers = exports.deleteOrder = exports.updateOrder = exports.createOrder = exports.getOrderById = exports.getAllOrders = void 0;
const Orders = require('../models/orders.model');
const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Orders.getAllOrders();
        res.status(200).json(orders);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.getAllOrders = getAllOrders;
const getOrderById = async (req, res, next) => {
    const orderId = req.params.id;
    try {
        const order = await Orders.getOrderById(orderId);
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        res.status(200).json(order);
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderById = getOrderById;
const createOrder = async (req, res, next) => {
    const orderData = req.body;
    try {
        const newOrder = await Orders.createOrder(orderData);
        res.status(201).json(newOrder);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.createOrder = createOrder;
const updateOrder = async (req, res, next) => {
    const orderId = req.params.id;
    const orderData = req.body;
    try {
        const updatedOrder = await Orders.updateOrder(orderId, orderData);
        if (!updatedOrder) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        res.status(200).json(updatedOrder);
    }
    catch (error) {
        next(error);
    }
};
exports.updateOrder = updateOrder;
const deleteOrder = async (req, res, next) => {
    const orderId = req.params.id;
    try {
        const deletedOrder = await Orders.deleteOrder(orderId);
        if (!deletedOrder) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        res.status(200).json({ message: 'Order deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteOrder = deleteOrder;
const getOrdersUsers = async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const orders = await Orders.getOrdersUsers(userId);
        if (!orders || orders.length === 0) {
            res.status(404).json({ message: 'No orders found for this user' });
            return;
        }
        res.status(200).json(orders);
    }
    catch (error) {
        next(error);
    }
};
exports.getOrdersUsers = getOrdersUsers;
