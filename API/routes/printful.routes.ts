const express = require("express")
const router = express.Router()
const printfulController = require("../controllers/printful.controller")


router.get("/", printfulController.getPrintfulProducts)
router.get("/:id", printfulController.getPrintfulProductDetails)



export default router