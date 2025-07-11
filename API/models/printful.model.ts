import { OrderData } from "../../Types/Orders";
import { ShippingData } from "../../Types/printful";

const axios = require("axios");
const db = require("../../db/index");
const printful = axios.create({
  baseURL: "https://api.printful.com",
  headers: {
    Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
  },
});

export const getPrintfulProducts = async () => {
  try {
    const response = await printful.get(`/store/products`);
    const products = response.data.result;
    console.log(products);
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch Printful products");
  }
};

export const getPrintfulProductDetails = async (productId:number) => {
  try {
    console.log(productId);
    const response = await printful.get(`/store/products/${productId}`);
    const productDetails = response.data;
    console.log(productDetails);
    return productDetails;
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw new Error("Failed to fetch product details");
  }
};

export const syncPrintfulProducts = async () => {
  // Product upsert query
  const productQuery = `
    INSERT INTO products (
      name, description, imageurl, is_printful, printful_id
    ) VALUES ($1, $1, $2, $3, $4)
    ON CONFLICT (printful_id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      imageurl = EXCLUDED.imageurl,
      is_printful = EXCLUDED.is_printful
  `;
  // Variant upsert query
  const variantQuery = `
    INSERT INTO sync_variants (
       product_id, sku, size, color, image_url, retail_price, currency, is_printful, printful_variant_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (printful_variant_id) DO UPDATE SET
      product_id = EXCLUDED.product_id,
      sku = EXCLUDED.sku,
      size = EXCLUDED.size,
      color = EXCLUDED.color,
      image_url = EXCLUDED.image_url,
      retail_price = EXCLUDED.retail_price,
      currency = EXCLUDED.currency,
      is_printful = EXCLUDED.is_printful
  `;
  // File upsert query
  const fileQuery = `
    INSERT INTO variant_files (variant_id, printful_file_id, file_url, filename, file_type, preview_url
    ) VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO UPDATE SET
      variant_id = EXCLUDED.variant_id,
      printful_file_id = EXCLUDED.printful_file_id,
      file_url = EXCLUDED.file_url,
      filename = EXCLUDED.filename,
      file_type = EXCLUDED.file_type,
      preview_url = EXCLUDED.preview_url
  `;
  // Option upsert query
  const optionQuery = `
    INSERT INTO variant_options (variant_id, option_key, option_value)
    VALUES ($1, $2, $3)
    ON CONFLICT (sync_variant_id, option_id) DO UPDATE SET
      option_value = EXCLUDED.option_value
  `;
  await db.query("BEGIN");
  try {
    //get list of all products ids
    const products = await getPrintfulProducts();

    //fetch each product and insert into the database
    for (const { id } of products) {
      const result = await getPrintfulProductDetails(id);
      const product = result.sync_product;
      const variants = result.sync_variants;
      //update products table
      const productQueryArray = [
        product.name,
        product.thumbnail_url,
        true,
        product.id,
      ];
      await db.query(productQuery, productQueryArray);
      //update variants table
      for (const variant of variants) {
        const variantQueryArray = [
          variant.sync_product_id,
          variant.sku,
          variant.size,
          variant.color,
          variant.product.image,
          variant.retail_price,
          variant.currency,
          true,
          variant.variant_id,
        ];
        await db.query(variantQuery, variantQueryArray);

        for (const variantFile of variant) {
          const fileQueryArray = [
            variant.variant_id,
            variantFile.id,
            variantFile.thumbnail_url,
            variantFile.filename,
            variantFile.mime_type,
            variantFile.preview_url,
          ];
          await db.query(fileQuery, fileQueryArray);
        }
        for (const variantOption of variant) {
          const optionQueryArray = [
            variantOption.variant_id,
            variantOption.option_value,
          ];
          await db.query(optionQuery, optionQueryArray);
        }
      }
    }
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error syncing Printful products:", error);
    throw new Error("Failed to sync Printful products");
  }
};

//Orders
export const getPrintfulOrders = async (orderId:number) => {
  try {
    const response = await printful.get(`/v2/orders/${orderId}/status`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Printful order status:", error);
    throw new Error("Failed to fetch Printful order status");
  }
};
export const getPrintfulOrderDetails = async (orderId:number) => {
  try {
    const response = await printful.get(`/v2/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Printful order details:", error);
    throw new Error("Failed to fetch Printful order details");
  }
};
export const updatePrintfulOrder = async (orderId:number, orderData:OrderData) => {
  try {
    const response = await printful.put(`/v2/orders/${orderId}`, orderData);
    return response.data;
  } catch (error) {
    console.error("Error updating Printful order:", error);
    throw new Error("Failed to update Printful order");
  }
};

export const cancelPrintfulOrder = async (orderId:number) => {
  try {
    const response = await printful.post(`/v2/orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    console.error("Error canceling Printful order:", error);
    throw new Error("Failed to cancel Printful order");
  }
};


export const calculateShipping = async (shippingData:ShippingData) => {
  try {
    const response = await printful.post(`/v2/shipping/rates`, shippingData);
    return response.data;
  } catch (error) {
    console.error("Error calculating shipping:", error);
    throw new Error("Failed to calculate shipping");
  }
};
export const calculateOrderCost = async (orderData:OrderData) => {
  try {
    const response = await printful.post(`/v2/orders/calculate`, orderData);
    return response.data;
  } catch (error) {
    console.error("Error calculating order cost:", error);
    throw new Error("Failed to calculate order cost");
  }
};


