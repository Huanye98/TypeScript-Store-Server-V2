"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = productDeleted;
const { db } = require("../../../db");
async function productDeleted(data) {
    console.log("Product deleted:", data);
    const id = data.sync_product.id;
    const productQuery = `
        delete from products
        where id = $1
    `;
    const variantQuery = `
        delete from variants
        where product_id = $1
    `;
    try {
        await db.query(productQuery, [id]);
        await db.query(variantQuery, [id]);
    }
    catch (error) {
        console.error("Error deleting product:", error);
        throw new Error("Failed to delete product");
    }
}
;
