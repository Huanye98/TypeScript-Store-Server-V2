const express = require("express")
const router = express.Router()
const productController = require("../controllers/product.controller")
router.get("/all",productController.getAllProducts)
router.get("/", productController.getProducts)
router.get("/:productId", productController.getProductById)
router.post("/create", productController.createProduct)
router.delete("/:productId",productController.deleteProduct )
router.delete("/variant/:variantId", productController.deleteVariant)
router.patch("/:productId", productController.patchProduct)
router.patch("/variant/:variantId", productController.patchVariant)


export default router
