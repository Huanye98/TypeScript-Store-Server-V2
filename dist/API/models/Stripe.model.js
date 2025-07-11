"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db = require("../../db/index");
const storeTransactionDb = async (transactionData) => {
    const { paymentId, userId, amount, currency, status, clientSecret } = transactionData;
    try {
        await db.query("insert into transactions (payment_id, user_id, amount, currency, status,client_secret) values ($1,$2,$3,$4,$5,$6)", [paymentId, userId, amount, currency, status, clientSecret]);
    }
    catch (error) {
        let errorMessage = "An error occurred while storing the transaction.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(`Database Error: failed to store transaction. ${errorMessage}`);
    }
};
const updatePaymentIntentDb = async (paymentIntentId, clientSecret) => {
    try {
        const payment = await db.query(`update transactions
            set status = 'complete' 
            where payment_id = $1 and client_secret = $2
            returning *`, [paymentIntentId, clientSecret]);
        if (!payment) {
            throw new Error("Payment not found");
        }
    }
    catch (error) {
        let errorMessage = "An error occurred while updating the payment intent.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.log("Database error:", error);
        throw new Error(`Database Error: failed to update payment data. ${errorMessage}`);
    }
};
module.exports = { storeTransactionDb, updatePaymentIntentDb };
