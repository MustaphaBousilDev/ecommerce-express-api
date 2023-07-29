const express=require('express')
const {authMiddleware,isAdmin, isGood}=require('../middleware/authMiddleware')
const upload=require('../middleware/multer')
//fs is file system using for delete file from server

const router=express.Router()
const {
     createImgsProduct,
     getAllImgsProduct,
     updateImgsProduct
}=require('../controller/imgsController')


router.post("/",isAdmin, upload.array("picture"),createImgsProduct);
router.get('/',isAdmin,getAllImgsProduct)
router.put('/:id',isAdmin,upload.single('picture'),updateImgsProduct)

//filtering and sorting category


module.exports=router