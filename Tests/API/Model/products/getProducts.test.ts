jest.mock("../../../../db/index", () => ({
  query: jest.fn(),
  connect: jest.fn().mockResolvedValue(null)
}));
const {queryAllProducts,getProductById,getProducts,findAndDeleteProduct,findAndDeleteVariant }= require("../../../../API/models/Product.model")
const db = require("../../../../db/index")


describe("queryAllProducts", () => {
  afterEach(()=>{
    jest.clearAllMocks()
  })
  it("should return all products", async () => {
   db.query.mockImplementation(()=>Promise.resolve({
        rows: [
            { id: 1, name: "Product 1", price: 100 },
            { id: 2, name: "Product 2", price: 200 },
        ],
        }));
    const products = await queryAllProducts();
    expect(products).toEqual( [
            { id: 1, name: "Product 1", price: 100 },
            { id: 2, name: "Product 2", price: 200 },
        ])
  });

  it("should return an empty array if no products exist", async () => {
    db.query.mockResolvedValue({
        rows: [],
        });
    const products = await queryAllProducts();
    expect(products).toEqual([]);
  });
});

describe("getProductsByid",()=>{
  beforeEach(()=>{
    jest.clearAllMocks()
  })

  it("should return a product by id",async ()=>{
    (db.query as jest.Mock).mockResolvedValue({
      rows:[{ id: 1, name: "Product 1", price: 100 }],
    })
    const product = await getProductById(1)
    expect(product).toBeDefined();
    expect(product.id).toBe(1)
    expect(product.name).toBe("Product 1")
    expect(product.price).toBe(100)
  })

})

describe("findAndDeleteProduct",()=>{
  beforeEach(()=>{
    jest.clearAllMocks()
  })
  const deleteProduct = { id: 1, name: "Product 1", price: 100 }
  it("should delete a product by id",async()=>{
    db.query.mockResolvedValue({
      rows:[{ id: 1, name: "Product 1", price: 100 }],
    })
    const result = await findAndDeleteProduct(1)
    expect(db.query).toHaveBeenCalledWith("DELETE FROM products where id = $1 RETURNING *",[1])
    expect(result).toEqual(deleteProduct)
  })
  it("should throw an error if there is no productId",async()=>{
    db.query.mockResolvedValue({rows:[]})
    await expect(findAndDeleteProduct()).rejects.toThrow("Product ID is required for deletion.")
    expect(db.query).not.toHaveBeenCalled()
  })
})

describe("findAndDeleteVariant",()=>{
  beforeEach(()=>{
    jest.clearAllMocks()
  })
  const deletedVariant = { id: 1, name: "Variant 1", price: 50 }

  it("should throw and error if there is no id",async()=>{
     db.query.mockResolvedValue({rows:[]})
    await expect(findAndDeleteVariant()).rejects.toThrow("Variant ID is required for deletion.")
    expect(db.query).not.toHaveBeenCalled()
  })
})