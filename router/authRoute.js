const express=require('express')
const router=express.Router()

const {createUser,getAllUsers, login,getUser}=require('../controller/userController')



router.post('/register',createUser);
router.post('/login',login)
router.get('/all',getAllUsers);
router.get('/:id',getUser)



module.exports=router