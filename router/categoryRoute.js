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

router.post('/',authMiddleware,isAdmin,createCategory)
router.get('/',authMiddleware,getAllCategory);
router.get('/:id',authMiddleware,getCategory);
router.put('/:id',authMiddleware,isAdmin,updateCategory)
router.delete('/:id',authMiddleware,isGood,deleteCategory)
router.put('/block/:id',authMiddleware,isAdmin,hiddenCategory)
router.put('/display/:id',authMiddleware,isAdmin,DisplayCategory)
router.post('/search',SearchCategory)
//filtering and sorting category


module.exports=router