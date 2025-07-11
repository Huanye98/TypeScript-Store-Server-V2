"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = productCreated;
const { db } = require("../../../db/index");
const { getPrintfulProducts, getPrintfulProductDetails, } = require("../../models/printful.model");
async function productCreated(data) {
    console.log("Product created:", data);
    const { id } = data.sync_product;
    const productQuery = `
  insert into products (
  name, 
  imageurl, 
  is_printful,
  printful_id)
  values ($1, $2, $3, $4)
  `;
    const variantQuery = `insert into variants (
  product_id,
  
  sku, 
  color,
  size,
  image_url, 
  is_printful, 
  printful_variant_id, 
  printful_retail_price)
  values ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
    try {
        const response = await getPrintfulProductDetails(id);
        const productDetails = response.result;
        //products
        const productQueryArray = [
            productDetails.sync_product.name,
            productDetails.sync_product.thumbnail_url,
            true,
            productDetails.sync_product.id,
        ];
        await db.query(productQuery, productQueryArray);
        //variants
        for (const variant of productDetails.sync_variants) {
            const variantsQueryArray = [
                variant.sync_product_id,
                variant.sku,
                variant.color,
                variant.size,
                variant.thumbnail_url,
                true,
                variant.variant_id,
                variant.printful_retail_price,
            ];
            await db.query(variantQuery, variantsQueryArray);
        }
    }
    catch (error) {
        console.error("Error creating product:", error);
        throw new Error("Failed to create product in the database");
    }
}
;
