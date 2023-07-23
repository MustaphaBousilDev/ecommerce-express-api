const express=require('express')
const {
     createColor,   
     getAllColor,
     updateColor,
     deleteColor,
     getColor,
     DisplayColor,
     hiddenColor,
     SearchColor
}=require('../controller/colorController')


const {authMiddleware,isAdmin, isGood}=require('../middleware/authMiddleware')
const router=express.Router()

router.post('/',isAdmin,createColor)
router.get('/',getAllColor);
router.put('/:id',isAdmin, updateColor)
router.delete('/:id',isGood,deleteColor)
router.get('/:id',getColor)
router.put('/block/:id',isAdmin,hiddenColor)
router.put('/display/:id',isAdmin,DisplayColor)
router.post('/search',SearchColor)

//filtering and sorting category


module.exports=router