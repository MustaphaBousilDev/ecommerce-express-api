const express=require('express')
const {
     createCountry,
     getAllCountry,
     updateCountry,
     deleteCountry,
     getCountry,
     hiddenCountry,
     DisplayCountry,
     SearchCountry
     
}=require('../controller/countryController')


const {authMiddleware,isAdmin, isGood}=require('../middleware/authMiddleware')
const router=express.Router()

router.post('/',isAdmin,createCountry)
router.get('/',getAllCountry);
router.put('/:id',isAdmin, updateCountry)
router.delete('/:id',isGood,deleteCountry)
router.get('/:id',getCountry)
router.put('/block/:id',isAdmin,hiddenCountry)
router.put('/display/:id',isAdmin,DisplayCountry)
router.post('/search',SearchCountry)

//filtering and sorting category


module.exports=router