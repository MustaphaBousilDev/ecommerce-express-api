const express=require('express')
const {
     createSize,
     getAllSize,
     updateSize,
     deleteSize,
     getSize,
     DisplaySize,
     hiddenSize,
     SearchSize
     
}=require('../controller/sizeController')


const {authMiddleware,isAdmin, isGood}=require('../middleware/authMiddleware')
const router=express.Router()

router.post('/',isAdmin,createSize)
router.get('/',getAllSize);
router.put('/:id',isAdmin, updateSize)
router.delete('/:id',isGood,deleteSize)
router.get('/:id',getSize)
router.put('/block/:id',isAdmin,hiddenSize)
router.put('/display/:id',isAdmin,DisplaySize)
router.post('/search',SearchSize)

//filtering and sorting category


module.exports=router