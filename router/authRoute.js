const express=require('express')
const router=express.Router()

const {createUser,getAllUsers, login,getUser,updateUser,blockUser,unblockUser}
=require('../controller/userController')
const {authMiddleware,isAdmin}=require('../middleware/authMiddleware')


router.post('/register',createUser);
router.post('/login',login)
router.get('/all',getAllUsers);
router.get('/:id',authMiddleware,isAdmin,getUser)
router.put('/update-user/:id',authMiddleware,isAdmin,updateUser)
router.put('/block-user/:id',authMiddleware,isAdmin,blockUser)
router.put('/unblock-user/:id',authMiddleware,isAdmin,unblockUser)



module.exports=router