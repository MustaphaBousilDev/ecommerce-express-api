const express=require('express')
const {
     createSubCategory,
     getAllSubCategory,
     updateSubCategory,
     deleteSubCategory,
     getSubCategory,
     hiddenSubCategory,
     SearchSubCategory,
     DisplaySubCategory
}=require('../controller/subCategoryController')


const {authMiddleware,isAdmin, isGood}=require('../middleware/authMiddleware')
const router=express.Router()

router.post('/',isAdmin,createSubCategory)
router.get('/',getAllSubCategory);
router.put('/:id',isAdmin,updateSubCategory)
router.delete('/:id',isGood,deleteSubCategory)
router.get('/:id',getSubCategory)
router.put('/block/:id',isAdmin,hiddenSubCategory)
router.put('/display/:id',isAdmin,DisplaySubCategory)
router.post('/search',SearchSubCategory)

//filtering and sorting category


module.exports=router