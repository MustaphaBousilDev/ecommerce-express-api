const express=require('express')
const {createProduct}=require('../controller/productController')
const {authMiddleware,isAdmin, isGood}=require('../middleware/authMiddleware')
const router=express.Router()

router.post('/',isAdmin,createProduct)

module.exports=router