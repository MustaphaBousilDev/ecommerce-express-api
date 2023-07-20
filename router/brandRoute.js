const express=require('express')
const {
     createBrand,
     getAllBrands,
     getBrand,
     updateBrand ,
     deleteBrand,
     hiddenBrand,
     DisplayBrand ,
     SearchBrand
}=require('../controller/brandController')


const {authMiddleware,isAdmin, isGood}=require('../middleware/authMiddleware')
const router=express.Router()

router.post('/',isAdmin,createBrand)
router.get('/',getAllBrands);
router.put('/:id',isAdmin, updateBrand)
router.delete('/:id',isGood,deleteBrand)
router.get('/:id',getBrand)
router.put('/block/:id',isAdmin,hiddenBrand)
router.put('/display/:id',isAdmin,DisplayBrand)
router.post('/search',SearchBrand)

//filtering and sorting category


module.exports=router