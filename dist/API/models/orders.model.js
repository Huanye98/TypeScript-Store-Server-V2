"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderDetailsUsers = exports.userGetsOrders = exports.deleteOrderDB = exports.updateOrderDB = exports.createOrderDB = exports.getOrderByIdDB = exports.getAllOrdersDB = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const path = require("path");
const crypto = require("crypto");
const os = require("os");
const fs = require("fs").promises;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createInvoicePDF } = require("../../pupeteer/index.js");
const db = require("../../db/index");
const { paymentIntent } = require("../controllers/stripe.controller");
const getAllOrdersDB = async () => {
    const allQuery = "SELECT * FROM orders";
    try {
        const response = await db.query(allQuery);
        return response.rows;
    }
    catch (error) {
        let errorMessage = "Unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(`Database Error: Unable to fetch all orders. ${errorMessage}`);
    }
};
exports.getAllOrdersDB = getAllOrdersDB;
const getOrderByIdDB = async (orderId) => {
    const query = "SELECT * FROM orders WHERE id = $1";
    try {
        const response = await db.query(query, [orderId]);
        return response.rows[0];
    }
    catch (error) {
        let errorMessage = "Unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(`Database Error: Unable to fetch order with ID ${orderId}. ${errorMessage}`);
    }
};
exports.getOrderByIdDB = getOrderByIdDB;
const createOrderDB = async (orderData) => {
    //validation
    const internalOrderData = orderData.internal_order;
    const printfulOrderData = orderData.printful_order;
    //invoice Data
    try {
        // stripe
        await makeStripePaymentIntent(internalOrderData);
        //create Order
        const order_id = await handleInternalOrder(internalOrderData);
        //create printful order
        if (printfulOrderData) {
            await createPrintfulOrder(printfulOrderData, order_id);
        }
        // create invoice
        await makeInvoice(internalOrderData, order_id);
    }
    catch (error) {
        let errorMessage = "Unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(`Database Error: Unable to create order. ${errorMessage}`);
    }
};
exports.createOrderDB = createOrderDB;
const makeStripePaymentIntent = async (internalOrder) => {
    const amount = internalOrder.payment.amount * 100; // Convert to cents
    const user_id = internalOrder.client.user_id;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "eur",
            automatic_payment_methods: {
                enabled: true,
            },
        });
        //Store into transactions table
        const query = "INSERT INTO transactions (price, status, user_id, payment_id, client_secret) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
        await db.query(query, [
            amount,
            "incomplete",
            user_id,
            paymentIntent.id,
            paymentIntent.client_secret,
        ]);
    }
    catch (error) {
        let errorMessage = "Unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(`Stripe Error: Unable to create payment intent. ${errorMessage}`);
    }
};
const handleInternalOrder = async (internalOrderData) => {
    const products = internalOrderData.order.products;
    try {
        //insert into order_items
        for (const product of products) {
            const subtotal = product.finalPrice * product.quantity * product.discount;
            const query = `insert into order_items (order_id,product_id,quantity,unit_price,subtotal,discount) values ($1,$2,$3,$4,$5,$6) returning *`;
            await db.query(query, [
                product.order_id,
                product.product_id,
                product.quantity,
                product.finalPrice,
                subtotal,
                product.discount,
            ]);
        }
        //create internal order
        const InternalOrderQuery = "INSERT INTO internal_orders (user_id, products, total_amount, tax_amount, shipping_cost, shipping_address, billing_address, payment_method, tracking_number, status, client_secret, gateway, gateway_transaction_id, type, last4_digits) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *";
        const orderQueryArray = [
            internalOrderData.client.user_id,
            internalOrderData.payment.totalAmount,
            internalOrderData.payment.tax_amount,
            internalOrderData.shipping.shipping_cost,
            internalOrderData.shipping.shipping_address,
            internalOrderData.payment.billing_address,
            internalOrderData.payment.payment_method,
            internalOrderData.shipping.tracking_number,
            "pending",
            undefined,
            internalOrderData.payment.gateway,
            internalOrderData.payment.gateway_transaction_id,
            internalOrderData.payment.method,
            internalOrderData.payment.last4_digits,
        ];
        const orderResponse = await db.query(InternalOrderQuery, orderQueryArray);
        return orderResponse.rows[0].id;
    }
    catch (error) {
        let errorMessage = "Unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(`Database Error: Unable to create order items. ${errorMessage}`);
    }
};
const createPrintfulOrder = async (printfulOrderData, order_id) => {
    // const printfulOrderPayload:PrintfulOrder = {
    //   "shippping": {},
    //   "recipient": {
    //     "name": orderData.name,
    //     "address1": orderData.address1,
    //     "city": orderData.city,
    //     "state_code": orderData.state_code,
    //     "country_code": orderData.country_code,
    //     "zip": orderData.zip,
    //     "phone": orderData.phone
    //   },
    //   "items":[],
    //   "retail_costs": {},
    //   "packing_slip": {
    //   }
    // }
    try {
        const response = await axios_1.default.post(`${process.env.PRINTFUL_API_URL}/orders`, printfulOrderData, {
            headers: { Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}` },
        });
        await db.query("update orders set printful_order_id = $1  where order_id = $2", [response.data.id, order_id]);
    }
    catch (error) {
        let errorMessage = "Unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(`Printful Error: Unable to create printful order. ${errorMessage}`);
    }
};
const makeInvoice = async (internalOrder, orderId) => {
    const items = internalOrder.order.products.map((product) => ({
        description: product.name,
        price: product.finalPrice * product.quantity * product.discount,
        quantity: product.quantity,
    }));
    const total = items.reduce((acc, item) => acc + item.price, 0);
    const invoiceData = {
        invoiceNumber: undefined, // This will be generated later,
        createdDate: undefined, // This will be generated later
        dueDate: undefined, // This will be generated later
        companyLogo: "https://sparksuite.github.io/simple-html-invoice-template/images/logo.png",
        company: {
            name: internalOrder.client.name,
            address: internalOrder.shipping.address,
            city: internalOrder.shipping.city,
            state: internalOrder.shipping.state,
            zip: internalOrder.shipping.zip,
            country: internalOrder.shipping.country,
        },
        client: {
            name: internalOrder.client.name,
            email: internalOrder.client.email,
            phone: internalOrder.client.phone,
        },
        payment: {
            method: internalOrder.payment.method,
            details: "",
        },
        items,
        currency: internalOrder.payment.currency || "EUR",
        total,
    };
    const tmpFilePath = path.join(os.tmpdir(), `invoice-${crypto.randomUUID()}.pdf`);
    try {
        const insertResponse = await db.query("insert into invoices (order_id) values ($1) returning invoice_id, created_at, dueDate", [orderId]);
        const invoiceRecord = insertResponse.rows[0];
        invoiceData.invoiceNumber = invoiceRecord.invoice_id;
        invoiceData.createdDate = invoiceRecord.created_at;
        invoiceData.dueDate = invoiceRecord.dueDate;
        const generatedInvoicePath = await createInvoicePDF(invoiceData, tmpFilePath);
        const formData = new form_data_1.default();
        formData.append("file", fs.createReadStream(generatedInvoicePath));
        formData.append("upload_preset", "invoice_uploads");
        const cloudinaryResponse = await axios_1.default.post(`${process.env.ORIGIN}/api/cloudinary/pdf`, formData, {
            headers: {
                ...formData.getHeaders(),
                "Content-Length": formData.getLengthSync(),
            },
        });
        const invoiceURL = cloudinaryResponse.data.secure_url;
        await db.query("UPDATE invoices SET invoice_url = $1 WHERE invoice_id = $2", [
            invoiceURL,
            invoiceRecord.invoice_id,
        ]);
        fs.unlink(generatedInvoicePath);
        return invoiceURL;
    }
    catch (error) {
        let errorMessage = "Unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error("Error creating invoice: " + errorMessage);
    }
};
const updateOrderDB = async (orderId, orderUpdateData) => {
    //shipping address, billing address, status, tracking number
    let query = "UPDATE orders SET ";
    const queryArray = [];
    // if (orderUpdateData.shipping_address) {
    //   query += "shipping_address = $1, ";
    //   queryArray.push(orderUpdateData.shipping_address);
    // }
    // if (orderUpdateData.billing_address) {
    //   query += "billing_address = $2, ";
    //   queryArray.push(orderUpdateData.billing_address);
    // }
    // if (orderUpdateData.status) {
    //   query += "status = $3, ";
    //   queryArray.push(orderUpdateData.status);
    // }
    // if (orderUpdateData.tracking_number) {
    //   query += "tracking_number = $4, ";
    //   queryArray.push(orderUpdateData.tracking_number);
    // }
    query = query.slice(0, -2) + " ";
    query += "WHERE id = $5 RETURNING *";
    queryArray.push(orderId);
    try {
        const response = await db.query(query, queryArray);
        return response.rows[0];
    }
    catch (error) {
        let errorMessage = "Unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(`Database Error: Unable to update order with ID ${orderId}. ${errorMessage}`);
    }
};
exports.updateOrderDB = updateOrderDB;
const deleteOrderDB = async (orderId) => {
    const query = "DELETE FROM orders WHERE id = $1 RETURNING *";
    try {
        const response = await db.query(query, [orderId]);
        return response.rows[0];
    }
    catch (error) {
        let errorMessage = "Unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(`Database Error: Unable to delete order with ID ${orderId}. ${errorMessage}`);
    }
};
exports.deleteOrderDB = deleteOrderDB;
const userGetsOrders = async (userId) => {
    const query = "SELECT order_id,total_amount,tax_amount,shipping_cost,shipping_address,billing_address,status,payment_method,tracking_number FROM orders WHERE user_id = $1";
    try {
        const response = await db.query(query, [userId]);
        const output = {
            userId: userId,
            orders: response.rows,
        };
        return output;
    }
    catch (error) {
        let errorMessage = "Unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(`Database Error: Unable to fetch orders for user with ID ${userId}. ${errorMessage}`);
    }
};
exports.userGetsOrders = userGetsOrders;
const getOrderDetailsUsers = async (orderId) => {
    const query = "select * from orders where order_id = $1";
    try {
        const response = await db.query(query, [orderId]);
        if (response.rows.length === 0) {
            throw new Error(`No order found with ID ${orderId}`);
        }
        return response.rows[0];
    }
    catch (error) {
        let errorMessage = "Unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(`Database Error: Unable to fetch order details for order with ID ${orderId}. ${errorMessage}`);
    }
};
exports.getOrderDetailsUsers = getOrderDetailsUsers;
