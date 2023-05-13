const User=require('../model/userModel')
const asyncHandler=require('express-async-handler')
const {generateToken}=require('../config/jwtToken')
//get validation from helper
const {EmailValidator,PasswordValidator,LengthValidator,USernameValidator}=require('../helpers/validations')
const bcrypt=require('bcryptjs')
const { refreshTokens } = require('../config/refreshToken')
const validateMongoDbId = require('../helpers/validateMongoDB')

//Create user
const createUser=asyncHandler(async (req,res)=>{
     const {
          first_name,
          last_name,
          username,
          email,
          mobile,
          password,
          picture}=req.body

     const emaild=await EmailValidator(email)
     const check=await User.findOne({email:email})
     if(check) return res.status(400).json({msg:'This email is already exists'})
     if(!LengthValidator(last_name,6,12)) return res.status(400).json({msg:'first name must be between 6 and 12 characters'})
     if(!LengthValidator(last_name,6,12)) return res.status(400).json({msg:'last name must be between 6 and 12 characters'})
     if(!LengthValidator(username,6,12)) return res.status(400).json({msg:'username must be between 6 and 12 characters'})
     if(!LengthValidator(password,8,20)) return res.status(400).json({msg:'password must be between 8 and 20 characters'})
     const salt=await bcrypt.genSaltSync(10)
     const cryptePassword=await bcrypt.hashSync(password,salt)
     let  tempUsername=first_name+last_name
     let  newUsername=await USernameValidator(tempUsername)
     const user=new User(
          {first_name,
          last_name,
          username:newUsername,
          email,
          mobile,
          password:cryptePassword,
          picture})
     user.save()
          .then((saveUser)=>{
               const token=generateToken({id:saveUser._id.toString()},"7d")
               res.status(200).json({msg:'user created',
               saveUser,
               token:token,
          })})
          .catch((error)=>{res.status(400).json({msg:error.message})})
}) 
//Login user 
const login=asyncHandler(async (req,res)=>{
     const {email,password}=req.body
     //check if email exist
     const findUser=await User.findOne({email:email})
     if(findUser && await findUser.isPasswordMatch(password,findUser.password)){
          const refreshToken=await refreshTokens(findUser?._id)
          console.log('fucking login')
          console.log(refreshToken)
          const updateUser=await User.findByIdAndUpdate(
               findUser.id,
               {refreshToken:refreshToken},
               //new:true for display new data after finish operation(is parametre optionnel)
               {new:true}
          )
          res.cookie("refreshToken",refreshToken,{
               httpOnly:true , 
               maxAge:72 * 60 * 60 * 1000
          })
          res.status(200).json({
               _id:findUser?._id,
               first_name:findUser?.first_name,
               last_name:findUser?.last_name,
               username:findUser?.username,
               email:findUser?.email,
               mobile:findUser?.mobile,
               picture:findUser?.picture,
               role:findUser?.role,
               token:generateToken({id:findUser._id},"3d")
          })
     }else{
          throw new Error('invalid email or password')
     }
     

})
//handle refresh token 
const handleRefreshToken=asyncHandler(async (req,res)=>{
     const cookie=req.cookies
     console.log(cookie)
     return 
     if(!cookie?.refreshToken) throw new Error("no Refresh Token in Cookie")
     const refreshToken=cookie.refreshToken
     const user=await User.findOne({refreshToken})
     if(!user) throw new Error("No Refresh Token Present in DB or Not Matched")
     JsonWebTokenError.verify(refreshToken,process.env.JWT_SECRET,(err,decoded)=>{
          if(err || user.id !==decoded.id){
               throw new Error("There is something wrong with refresh token")
          }
          const accessToken=generateToken(user?._id)
          res.json({accessToken})
     })
})
//Login admin 
const loginAdmin=asyncHandler(async (req,res)=>{
     const {email,password}=req.body 
     //check if user exist or note 
     const findAdmin=await User.findOne({email})
     if(findAdmin.role !=="admin") throw new Error('Not fucking Authorized')
     if(findAdmin && (await findAdmin.isPasswordMatched(password))){
          const refreshToken=await refreshTokens(findAdmin?._id)
          const updateUser=await User.findByIdAndUpdate(
               findAdmin.id ,
               {
                    refreshToken:refreshToken
               },
               {new:true}
          )
          res.cookie("refreshToken",refreshToken,{
               httpOnly:true , 
               maxAge:72*60*60*1000,
          });

          res.json({
               _id:findUser?._id,
               first_name:findUser?.first_name,
               last_name:findUser?.last_name,
               username:findUser?.username,
               email:findUser?.email,
               mobile:findUser?.mobile,
               picture:findUser?.picture,
               role:findUser?.role,
               token:generateToken({id:findUser._id.toString()},"7d")
          })
     }else{throw new Error("Invalid Credentials")}
})

//logout 
const logOut=asyncHandler(async (req,res)=>{
     const cookie=req.cookies 
     if(!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies")
     const refreshToken=cookie.refreshToken 
     const user=await User.findOne({refreshToken})
     if(!user){
          res.clearCookie('refreshToken',{
               httpOnly:true , 
               secure:true 
          })
          return res.sendStatus(204)//forbidden 
     }
     await User.findOneAndUpdate(refreshToken,{
          refreshToken:"",
     })
     res.clearCookie("refreshToken",{
          httpOnly:true , 
          secure:true 
     })
     res.sendStatus(204)
})
//get All Users 
const getAllUsers=asyncHandler(async (req,res)=>{
     try{
          const users=await User.find()
          res.status(200).json({users})
     }catch(error){
          res.status(400).json({msg:error.message})
     }
})
//get user 
const getUser=asyncHandler(async (req,res)=>{
     const {id}=req.params 
     validateMongoDbId(id)
     try{
          const user=await User.findById(id)
          res.status(200).json({user})
     }catch(error){res.status(400).json({message:'user not found'})}
})
//update user 
const updateUser=asyncHandler(async (req,res)=>{
     const {_id}=req.user
     validateMongoDbId(_id)
     try{ 
          const updateUser=await User.findByIdAndUpdate(_id,{
               first_name:req?.body?.first_name,
               last_name:req?.body?.last_name,
               username:req?.body?.username,
               email:req?.body?.email,
               mobile:req?.body?.mobile,
               picture:req?.body?.picture,
               role:req?.body?.role,
          },{new:true})
          //check all fields change old value with new value
          res.status(200).json({msg:'user updated',updateUser})
     }catch(error){
          throw new Error(error.message)
     }
})
//delete user 
const deleteUser=asyncHandler(async (req,res)=>{
     const {id}=req.params 
     validateMongoDbId(id)
     try{
          const deleteUser=await User.findByIdAndDelete(id) 
          res.json({
               deleteUser,
          })
     }catch(error){
          throw new Error(error)
     }
})
//block user
const blockUser=asyncHandler(async (req,res)=>{
     const {id}=req.params 
     validateMongoDbId(id)
     try{
          const blockUser=await User.findByIdAndUpdate(
               id,{isBlocked:true},{new:true}
          )
          res.json(blockUser)
     }catch(error){
          throw new Error(error)
     }
})
//unblock user 
const unblockUser=asyncHandler(async (req,res)=>{
     const {id}=req.params 
     validateMongoDbId(id)
     try{
          const unblock=await User.findByIdAndUpdate(
               id, 
               {isBlocked:false},
               {new:true}
          )
          res.json({
               message:"User UnBlocked"
          })
     }catch(error){
          throw new Error(error)
     }
})
//update user password 
const updatePassword=asyncHandler(async (req,res)=>{
     const {_id}=req.user 
     const {password}=req.body 
     validateMongoDbId(_id)
     const user=await User.findById(_id)
     if(password){
          user.password=password
          const updatedPassword=await user.save()
          res.json(updatePassword)
     }else{
          res.json(user)   
     }
})


module.exports={
createUser,
logOut,
loginAdmin,
deleteUser,
handleRefreshToken,
getAllUsers,
login,
getUser,
updateUser,
blockUser,
updatePassword,
unblockUser}