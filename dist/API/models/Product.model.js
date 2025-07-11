"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db = require("../../db/index");
//adjust for searchbar
const queryAllProducts = async () => {
    const allQuery = "select name,id from products";
    try {
        const response = await db.query(allQuery);
        return response.rows;
    }
    catch (error) {
        let errorMessage = "An error occurred while fetching all products.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(`Database Error:was not able to fetch all products. ${errorMessage} `);
    }
};
const getProducts = async (filters) => {
    //query selectors
    const { id, category, collection, sort, isavaliable, is_featured, artist, page = 1, limit = 10, } = filters;
    let baseQuery = `
  Select 
    products.id,
    products.name,
    products.description,
    products.isavaliable,
    products.imageurl,
    products.is_featured,
    products.artist,
    products.collection,
    variants.retail_price,
    variants.discount_value
  from products 
  Left JOIN variants
    on variants.product_id = products.id
    and variants.is_default = true
  where 1 = 1
  `;
    const values = [];
    let index = 1;
    if (id) {
        baseQuery += ` AND products.id = $${index++}`;
        values.push(id);
    }
    if (category) {
        baseQuery += ` AND products.category = $${index++}`;
        values.push(category);
    }
    if (is_featured) {
        baseQuery += ` AND products.is_featured = $${index++}`;
        values.push(is_featured);
    }
    if (isavaliable) {
        baseQuery += ` AND products.isavaliable = $${index++}`;
        values.push(isavaliable);
    }
    if (collection) {
        baseQuery += ` AND products.collection = $${index++}`;
        values.push(collection);
    }
    if (artist) {
        baseQuery += ` AND products.artist = $${index++}`;
        values.push(artist);
    }
    // get the amount of products
    const filteredQuery = baseQuery;
    const countValues = [...values];
    const countQuery = `select count(*) as total from (${filteredQuery}) as sub`;
    //prevent duplicates
    baseQuery += ` Group by products.id, variants.id`;
    //sort
    if (sort) {
        const [column, direction] = sort.split(":");
        const sortMappings = {
            name: "products.name",
            price: "variants.retail_price",
            items_sold: "products.items_sold",
            created_at: "products.created_at",
        };
        const dirLower = direction.toLowerCase();
        if (sortMappings[column] && ["asc", "desc"].includes(dirLower)) {
            baseQuery += ` ORDER BY ${sortMappings[column]} ${dirLower.toUpperCase()}`;
        }
        else {
            baseQuery += ` ORDER BY products.id ASC`;
        }
    }
    else {
        baseQuery += ` ORDER BY products.id ASC`;
    }
    //pagination
    const offset = (page - 1) * limit;
    baseQuery += ` LIMIT $${index++} OFFSET $${index++}`;
    values.push(limit, offset);
    try {
        const productRows = await db.query(baseQuery, values);
        const countResult = await db.query(countQuery, countValues);
        const totalCount = parseInt(countResult.rows[0].total, 10);
        //price calculation
        const products = productRows.rows.map((product) => ({
            ...product,
            finalPrice: product.retail_price !== null
                ? product.retail_price * (1 - (product.discount_value || 0))
                : null,
        }));
        return { products, totalCount };
    }
    catch (error) {
        let errorMessage = "An error occurred while fetching products.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(`Database Error: Was not able to fetch selected products. ${errorMessage}`);
    }
};
const getProductById = async (id) => {
    if (!id) {
        throw new Error("Product ID is required");
    }
    const query = `Select 
    products.id,
    products.name,
    products.description,
    products.isavaliable,
    products.imageurl,
    products.is_featured,
    products.artist,
    products.collection,
    variants.retail_price,
    variants.discount_value,
    variants.size,
    variants.color,
    variants.image_url,
    variants.stock
    variant_files.file_url
    variant_files.preview_url
    variant_options.option_value
  from products 
  Left JOIN variants
    on variants.product_id = products.id
    and variants.is_default = true
  Left JOIN variant_files 
   on variant_files.variant_id = variants.printful_variant_id
  Left joint 
    on variant_options.variant_id = variants.printful_variant_id
  where products.id = $1`;
    try {
        const { rows } = await db.query(query, [id]);
        if (rows.length === 0) {
            throw new Error(`Product with ID ${id} not found`);
        }
        const product = rows[0];
        if (product.discountvalue !== 1) {
            product.finalPrice =
                product.price - product.price * product.discountvalue;
        }
        else {
            product.finalPrice = product.price;
        }
        return product;
    }
    catch (error) {
        let errorMessage = "An error occurred while fetching the product.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(`Database Error: Failed to fetch product by ID. ${errorMessage}`);
    }
};
const createProduct = async (product) => {
    const { name, base_price, description, isavaliable, imageurl, is_featured, artist, collection, type, category, options, variants, } = product;
    let query = `insert into products (name, base_price`;
    const values = [name, base_price];
    //add fields to qury and values array
    const fields = [
        name,
        base_price,
        description,
        isavaliable,
        imageurl,
        is_featured,
        artist,
        collection,
        type,
        category,
    ];
    fields.forEach((field) => {
        if (field !== undefined && field !== null) {
            query += `, ${field}`;
            values.push(field);
        }
    });
    Object.entries(options).forEach(([key, value]) => {
        query += `${key} `;
        values.push(value.toString());
    });
    query += `) VALUES (${values
        .map((_, i) => `$${i + 1}`)
        .join(", ")}) RETURNING *`;
    try {
        const res = await db.query(query, values);
        const product_id = res.rows[0].id;
        await createVariants(variants, product_id);
        return res.rows[0];
    }
    catch (error) {
        let errorMessage = "An error occurred while creating the product.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(`Database Error: Failed to create product. ${errorMessage}`);
    }
};
const createVariants = async (variants, product_id) => {
    for (const variant of variants) {
        const columns = ["product_id",];
        const values = [product_id];
        Object.entries(variant).forEach(([key, value]) => {
            if (value !== undefined && value !== null && key !== "options") {
                columns.push(key);
                values.push(value);
            }
        });
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
        const query = `INSERT INTO variants (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *`;
        try {
            const response = await db.query(query, values);
            const variantId = response.rows[0].id;
            if (variant.options) {
                for (const [name, value] of Object.entries(variant.options)) {
                    await createVariantOption(variantId, name, value);
                }
            }
        }
        catch (error) {
            let errorMessage = "An error occurred while creating the variant.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            throw new Error(`Database Error: Failed to create variant. ${errorMessage}`);
        }
    }
};
const createVariantOption = async (variantId, name, value) => {
    for (const [option_value, price_modification] of Object.entries(value)) {
        const query = `INSERT INTO variant_options (variant_id, option_name, option_value,price_modification) VALUES ($1, $2, $3,$4) RETURNING *`;
        try {
            await db.query(query, [variantId, name, option_value, price_modification]);
        }
        catch (error) {
            let errorMessage = "An error occurred while creating the variant option.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            throw new Error(`Database Error: Failed to create variant option. ${errorMessage}`);
        }
    }
};
const findAndDeleteProduct = async (id) => {
    if (!id) {
        throw new Error("Product ID is required for deletion.");
    }
    const query = `DELETE FROM products where id = $1 RETURNING *`;
    try {
        const { rows } = await db.query(query, [id]);
        if (rows.length === 0) {
            throw new Error(`Product with ID ${id} not found`);
        }
        return rows[0];
    }
    catch (error) {
        let errorMessage = "An error occurred while deleting the product.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(`Database Error: Failed to delete product. ${errorMessage}`);
    }
};
const findAndDeleteVariant = async (id) => {
    const query = "alter table variants delete row where id = $1*";
    try {
        await db(query, [id]);
    }
    catch (error) { }
};
const patchProductInDB = async (productId, updates) => {
    if (!updates || Object.keys(updates).length === 0) {
        throw new Error("No updates have been provided");
    }
    const sanitizedUpdates = Object.fromEntries(Object.entries(updates).map(([key, value]) => [
        key,
        value === "" ? null : value,
    ]));
    try {
        const fields = Object.keys(sanitizedUpdates);
        const values = Object.values(sanitizedUpdates);
        const addToQuery = fields
            .map((field, index) => `${field} = $${index + 1}`)
            .join(", ");
        const query = `UPDATE products SET ${addToQuery} WHERE id = $${fields.length + 1}`;
        await db.query(query, [...values, productId]);
        return { message: "Product updated successfully" };
    }
    catch (error) {
        let errorMessage = "An error occurred while updating the product.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(`Database Error: Failed to update product. ${errorMessage}`);
    }
};
const patchVariant = async (variantId, variantUpdates) => {
    let query = `alter table variant update rows where id = $1 `;
    let queryArray = [variantId];
    try {
        await db(query, []);
    }
    catch (error) { }
};
module.exports = {
    getProducts,
    createProduct,
    findAndDeleteProduct,
    patchProductInDB,
    queryAllProducts,
    getProductById,
};
