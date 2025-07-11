const {queryAllProducts }= require("../../../../API/models/Product.model")
const db = require("../../../../db/index")

jest.mock("../../../../db/index", () => ({
  query: jest.fn(),
}));

describe("Products Model", () => {
  it("should return all products", async () => {
   (db.query as jest.Mock).mockResolvedValue({
        rows: [
            { id: 1, name: "Product 1", price: 100 },
            { id: 2, name: "Product 2", price: 200 },
        ],
        });
    const products = await queryAllProducts();
    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });

  it("should return an empty array if no products exist", async () => {
    db.query.mockResolvedValue({
        rows: [],
        });
    const products = await queryAllProducts();
    expect(products).toEqual([]);
  });
});