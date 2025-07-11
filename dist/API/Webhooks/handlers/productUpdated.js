"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = productUpdated;
const db = require("../../../db/index");
const { getPrintfulProductDetails, } = require("../../models/printful.model");
async function productUpdated(data) {
    console.log("Product updated:", data);
    const { id } = data.sync_product;
    const productQuery = `
  update products
  set name = $1, 
  imageurl = $2, 
  is_printful = $3
  where printful_id = $4
  `;
    const variantQuery = `
  update variants
  set product_id = $1,
  sku = $2, 
  color = $3,
  size = $4,
  image_url = $5, 
  is_printful = $6, 
  printful_retail_price = $7
  where printful_variant_id = $8
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
                variant.printful_retail_price,
                variant.variant_id,
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
