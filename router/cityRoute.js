const express=require('express')
const {
     createCity,
     getAllCity,
     updateCity,
     deleteCity,
     getCity,
     hiddenCity,
     DisplayCity,
     SearchCity
}=require('../controller/cityController')


const {authMiddleware,isAdmin, isGood}=require('../middleware/authMiddleware')
const router=express.Router()

router.post('/',isAdmin,createCity)
router.get('/',getAllCity);
router.put('/:id',isAdmin, updateCity)
router.delete('/:id',isGood,deleteCity)
router.get('/:id',getCity)
router.put('/block/:id',isAdmin,hiddenCity)
router.put('/display/:id',isAdmin,DisplayCity)
router.post('/search',SearchCity)

//filtering and sorting category


module.exports=router