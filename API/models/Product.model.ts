import { Filters } from "../../Types";
import {
  Product,
  VariantInput,
  ProductInput,
  VariantUpdates,
  VariantFile,
  VariantOption,
  ProductUpdates,
} from "../../Types/Products";
const db = require("../../db/index");

//adjust for searchbar
const queryAllProducts = async () => {
  const allQuery = "select name,id from products";

  try {
    const response = await db.query(allQuery);
    return response.rows;
  } catch (error: unknown) {
    let errorMessage = "An error occurred while fetching all products.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(
      `Database Error:was not able to fetch all products. ${errorMessage} `
    );
  }
};
const getProducts = async (filters: Filters) => {
  //query selectors
  const {
    id,
    category,
    collection,
    sort,
    isavaliable,
    is_featured,
    artist,
    page = 1,
    limit = 10,
  } = filters;

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
    const sortMappings: Record<string, string> = {
      name: "products.name",
      price: "variants.retail_price",
      items_sold: "products.items_sold",
      created_at: "products.created_at",
    };
    const dirLower = direction.toLowerCase();
    if (sortMappings[column] && ["asc", "desc"].includes(dirLower)) {
      baseQuery += ` ORDER BY ${
        sortMappings[column]
      } ${dirLower.toUpperCase()}`;
    } else {
      baseQuery += ` ORDER BY products.id ASC`;
    }
  } else {
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
    const products = productRows.rows.map((product: Product) => ({
      ...product,
      finalPrice:
        product.retail_price !== null
          ? product.retail_price * (1 - (product.discount_value || 0))
          : null,
    }));

    return { products, totalCount };
  } catch (error: unknown) {
    let errorMessage = "An error occurred while fetching products.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(
      `Database Error: Was not able to fetch selected products. ${errorMessage}`
    );
  }
};
const getProductById = async (id: number) => {
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
    variants.stock,
    variant_files.file_url,
    variant_files.preview_url,
    variant_options.option_value
  from products 
  Left JOIN variants
    on variants.product_id = products.id
    and variants.is_default = true
  Left JOIN variant_files 
   on variant_files.variant_id = variants.printful_variant_id
  Left join variant_options
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
    } else {
      product.finalPrice = product.price;
    }
    return product;
  } catch (error: unknown) {
    let errorMessage = "An error occurred while fetching the product.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(
      `Database Error: Failed to fetch product by ID. ${errorMessage}`
    );
  }
};
const createProduct = async (product: ProductInput) => {
  const {
    name,
    base_price,
    description,
    isavaliable,
    imageurl,
    is_featured,
    artist,
    collection,
    product_type,
    category,
    options,
    discount_value,
    variants,
  } = product;

  let query = `insert into products (name, base_price`;
  const values: (string | number | boolean)[] = [name, base_price];
  const fields = {
    description: description,
    isavaliable: isavaliable,
    imageurl: imageurl,
    is_featured: is_featured,
    artist: artist,
    collection: collection,
    product_type: product_type,
    category: category,
  };

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query += `, ${key}`;
      values.push(value);
    }
  });
  query += `) VALUES (${values
    .map((_, i) => `$${i + 1}`)
    .join(", ")}) RETURNING *`;

  try {
    const res = await db.query(query, values);
    const product_id = res.rows[0].id;
    await createVariants(variants, product_id, discount_value, base_price);
    if (options) {
      await createProductOptions(product_id, options);
    }
    return res.rows[0];
  } catch (error: unknown) {
    let errorMessage = "An error occurred while creating the product.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(
      `Database Error: Failed to create product. ${errorMessage}`
    );
  }
};
const createVariants = async (
  variants: VariantInput[],
  product_id: number,
  discount_value: number,
  base_price: number
) => {
  if (variants) {
    const allowedColumns = ["stock", "retail_price", "image_url", "sku"];
    for (const variant of variants) {
      if (variant.options) {
        let priceModifiers = Object.values(variant.options).reduce(
          (sum, inner) => {
            return (
              sum +
              Object.values(inner).reduce((innersum, num) => innersum + num, 0)
            );
          },
          0
        );
        variant.retail_price =
          base_price * (1 - discount_value) + priceModifiers;
      }

      const columns = ["product_id"];
      const values: (string | number | boolean)[] = [product_id];
      Object.entries(variant).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          key !== "options" &&
          allowedColumns.includes(key)
        ) {
          columns.push(key);
          values.push(value);
        }
      });
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
      const query = `INSERT INTO variants (${columns.join(
        ", "
      )}) VALUES (${placeholders}) RETURNING *`;

      try {
        const response = await db.query(query, values);
        const variantId = response.rows[0].id;
        if (variant.options) {
          for (const [name, value] of Object.entries(variant.options)) {
            await createVariantOption(variantId, name, value);
          }
        }
      } catch (error) {
        let errorMessage = "An error occurred while creating the variant.";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        throw new Error(
          `Database Error: Failed to create variant. ${errorMessage}`
        );
      }
    }
  } else {
    const retail_price = base_price * (1 - discount_value);
    const query = `INSERT INTO variants (product_id,discount_value,retail_price,is_default) VALUES ($1, $2,$3,$4) RETURNING *`;
    try {
      await db.query(query, [product_id, discount_value, retail_price, true]);
    } catch (error) {
      let errorMessage = "An error occurred while creating the variant.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      throw new Error(
        `Database Error: Failed to create variant. ${errorMessage}`
      );
    }
  }
};
const createVariantOption = async (
  variantId: number,
  name: string,
  value: Record<string, number>
) => {
  for (const [option_value, price_modification] of Object.entries(value)) {
    const query = `INSERT INTO variant_options (variant_id, option_name, option_value,price_modifier) VALUES ($1, $2, $3,$4) RETURNING *`;
    try {
      await db.query(query, [
        variantId,
        name,
        option_value,
        price_modification,
      ]);
    } catch (error: unknown) {
      let errorMessage = "An error occurred while creating the variant option.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      throw new Error(
        `Database Error: Failed to create variant option. ${errorMessage}`
      );
    }
  }
};
const createProductOptions = async (
  product_id: number,
  options: Record<string, string[]>
) => {
  for (const [optionName, optionValues] of Object.entries(options)) {
    try {
      const query = `insert into options (product_id, name, value) values ($1, $2, $3) returning *`;
      await db.query(query, [product_id, optionName, optionValues]);
    } catch (error) {
      console.error(`Failed to insert option ${optionName}`, error);
    }
  }
};

const findAndDeleteProduct = async (id: number) => {
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
  } catch (error: unknown) {
    let errorMessage = "An error occurred while deleting the product.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(
      `Database Error: Failed to delete product. ${errorMessage}`
    );
  }
};
const findAndDeleteVariant = async (id: number) => {
  if (!id) {
    throw new Error("Variant ID is required for deletion.");
  }
  const query = "delete from variants where id = $1";
  try {
    const response = await db(query, [id]);
    return response.rows[0];
  } catch (error: unknown) {
    let errorMessage = "An error occurred while deleting the variant.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(
      `Database Error: Failed to delete variant. ${errorMessage}`
    );
  }
};

const patchProductInDB = async (productId: number, updates: ProductUpdates) => {
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error("No updates have been provided");
  }
  const allowedFields = [
    "name",
    "description",
    "isavaliable",
    "imageurl",
    "category",
    "is_featured",
    "is_printful",
    "artist",
    "collection",
    "base_price",
    "product_type",
  ];
  const filteredUpdates = Object.entries(updates).filter(
    ([key, value]) =>
      value !== undefined && value !== null && allowedFields.includes(key)
  );
  const query = `update products set ${filteredUpdates
    .map(([key], index) => `${key} = $${index + 1}`)
    .join(", ")} where id = $${filteredUpdates.length + 1}`;
  const values = filteredUpdates.map(([, value]) => value);

  try {
    await db.query(query, [values, productId]);
  } catch (error: unknown) {
    let errorMessage = "An error occurred while updating the product.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(
      `Database Error: Failed to update product. ${errorMessage}`
    );
  }
};
const patchVariant = async (
  variantId: number,
  variantUpdates: VariantUpdates
) => {
  const allowedFields = [
    "sku",
    "size",
    "color",
    "image_url",
    "discount_value",
    "retail_price",
    "stock",
    "is_default",
  ];
  const entries = Object.entries(variantUpdates).filter(([key]) =>
    allowedFields.includes(key)
  );
  if (entries.length === 0) {
    throw new Error("No valid updates provided for the variant.");
  }
  const setClauses = entries.map(([key], index) => `${key} = $${index + 2}`);
  const values = entries.map(([, value]) => value);
  const query = `update variants set ${setClauses.join(
    ", "
  )} where id = $1 returning *`;

  try {
    const response = await db.query(query, [variantId, ...values]);
    const optionResponse = await patchVariantOptions(variantUpdates.variant_options || []);
    return { variant: response.rows[0], options: optionResponse };
  } catch (error: unknown) {
    let errorMessage = "An error occurred while updating the variant.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(
      `Database Error: Failed to update variant. ${errorMessage}`
    );
  }
};

const patchVariantOptions = async (options: VariantOption[]) => {
  try {
    const promises = options.map(async (option) => {
      const query = `update variant_options set option_name = $1, option_value = $2, price_modifier = $3 where id = $4 returning *`;
      const response = await db.query(query, [
        option.option_name,
        option.option_value,
        option.price_modifier,
        option.id,
      ]);
      return response;
    });
    const result = await Promise.all(promises);
    const updatedOptions = result.map((res) => res.rows[0]);
    return updatedOptions;
    
  } catch (error: unknown) {
    let errorMessage = "An error occurred while updating variant options.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(
      `Database Error: Failed to update variant options. ${errorMessage}`
    );
  }
};

module.exports = {
  getProducts,
  createProduct,
  findAndDeleteProduct,
  findAndDeleteVariant,
  patchProductInDB,
  queryAllProducts,
  getProductById,
  patchVariant,
};
