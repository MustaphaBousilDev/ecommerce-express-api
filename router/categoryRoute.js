const express=require('express')
const {createCategory,
     getAllCategory,
     updateCategory,
     SearchCategory,
     deleteCategory,
     hiddenCategory,
     getCategory,
DisplayCategory}=require('../controller/categoryController')


const {authMiddleware,isAdmin, isGood}=require('../middleware/authMiddleware')
const router=express.Router()

router.post('/',isAdmin,createCategory)
router.get('/',getAllCategory);
router.get('/:id',getCategory);
router.put('/:id',isAdmin,updateCategory)
router.delete('/:id',isGood,deleteCategory)
router.put('/block/:id',isAdmin,hiddenCategory)
router.put('/display/:id',isAdmin,DisplayCategory)
router.post('/search',SearchCategory)
//filtering and sorting category


module.exports=router