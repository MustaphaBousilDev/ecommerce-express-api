const express=require('express')
const router=express.Router()


const {
createUser,
getAllUsers,
login,
getUser,
updateUser,
loginAdmin,
handleRefreshTokens,
logOut,
deleteUser,
activeAccount,
blockUser,
sendVerification,
unblockUser,
resetPassword,
getProfile,
changePassword}=require('../controller/userController')

const {authMiddleware,isAdmin}=require('../middleware/authMiddleware')
const ApiRateLimiter=require('../middleware/rateLimiting')

router.get('/logout',authMiddleware,logOut)
router.post('/register',createUser);
router.get("/refresh", handleRefreshTokens);
router.post('/login',ApiRateLimiter,login)
router.get('/all-Users',getAllUsers);
router.get('/:id',authMiddleware,isAdmin,getUser)
router.put('/update-user/:id',authMiddleware,isAdmin,updateUser)
router.post('/login-admin',loginAdmin)
router.delete('/delete-user/:id',authMiddleware,isAdmin,deleteUser)
router.put('/block-user/:id',authMiddleware,isAdmin,blockUser)
router.put('/unblock-user/:id',authMiddleware,isAdmin,unblockUser)
router.post('/activate',authMiddleware,activeAccount)
router.post('/sendVerification',authMiddleware,sendVerification)
router.post('sendResetPasswordCode',resetPassword)
router.post('/changePassword',changePassword)
router.post('/getProfile',authMiddleware,isAdmin,getProfile)
router.post('/updatePicture',authMiddleware,isAdmin,getProfile)


module.exports=router