const { db } = require("../../../db");
import {Data} from "../../../Types/printful"
export default async function productDeleted(data:Data) {
  console.log("Product deleted:", data);
  const id = data.sync_product.id
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
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Failed to delete product");
  }
};


