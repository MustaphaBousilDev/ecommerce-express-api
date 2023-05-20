const User=require('../model/userModel')
const asyncHandler=require('express-async-handler')
const {generateToken}=require('../config/jwtToken')
//get validation from helper
const jwt=require('jsonwebtoken')
const {EmailValidator,PasswordValidator,LengthValidator,USernameValidator}=require('../helpers/validations')
const bcrypt=require('bcryptjs')
const { refreshTokens } = require('../config/refreshToken')
const validateMongoDbId = require('../helpers/validateMongoDB')
const {sendVerificationEmail}=require('../helpers/mailer')

//Create user
const createUser=asyncHandler(async (req,res)=>{
     const {first_name,last_name,username,email,mobile,password,picture}=req.body
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
               const emailVerificationToken=generateToken({id:saveUser._id.toString()},"30m")
               const url=`${process.env.BASE_URL}/activate/${emailVerificationToken}`
               sendVerificationEmail(saveUser.email,saveUser.first_name,url)
               const token=generateToken({id:saveUser._id.toString()},"7d")
               res.status(200).json({msg:'user created',
               saveUser,
               token:token,
               message:'Register Success , please activate your email'
          })})
          .catch((error)=>{res.status(400).json({msg:error.message})})
}) 
//Login user 
const login=asyncHandler(async (req,res)=>{
     const {email,password}=req.body
     const findUser=await User.findOne({email:email})
     if(findUser && await findUser.isPasswordMatch(password,findUser.password)){
          const refreshToken=await refreshTokens(findUser?._id)
          const updateUser=await User.findByIdAndUpdate(
               findUser.id,
               {refreshToken:refreshToken},
               {new:true}
          )

          // Increments the login count for the user
          await findUser.incrementLoginCount();

          // secure true to allow https only
          res.cookie("refreshToken",refreshToken,{
               httpOnly:true, 
               sameSite:'strict',
               secure:false,
               maxAge:72 * 60 * 60 * 1000,
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
          return res.status(401).json({message:'Invalid email or password'})
     }
     

})
//handle refresh token 
const handleRefreshTokens = asyncHandler(async (req, res) => {
     const cookie = req.cookies;
     console.log('fuck the goods')
     console.log(cookie)
     if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
     const refreshToken = cookie.refreshToken;
     console.log('refreshToken:',refreshToken)
     const user = await User.findOne({ refreshToken });
     console.log(user)
     if (!user) throw new Error(" No Refresh token present in db or not matched");
     
     jwt.verify(refreshToken, process.env.SECRET_KEY_TOKEN, (err, decoded) => {
       if (err || user.id !== decoded.id) {
         throw new Error("There is something wrong with refresh token");
       }
       const accessToken = generateToken({id:user?._id},"3d");
       res.json({ accessToken });
     });
});
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
//activate account 
const activeAccount=asyncHandler(async (req,res)=>{
     try {
          const validUser = req.user.id;
          const validateFirst=req.user.first_name
          //console.log(validateFirst)
          //console.log('tototo')
          //console.log(validUser)
          //get 
          const {token}=req.body 
          //console.log(token)
          const user=jwt.verify(token,process.env.SECRET_KEY_TOKEN)
          //console.log('fucking user')
          console.log(user.payload.id)
          const check=await User.findById(user.payload.id)
          console.log(check)
          if (validUser !== user.payload.id) {
               return res.status(400).json({
                 message: "You don't have the authorization to complete this operation.",
               });
          }
          if(check.verified==true){
               res.status(400).json({message:"this email is alrealy activated"})
          }else{
               await User.findByIdAndUpdate(user.payload.id,{verified:true})
               return res.status(200).json({message:"success verifiad this email"})
          }
     }catch(error){
          res.status(500).json({message:error.message})
     }
})
//reset password 
const resetPassword = asyncHandler(async (req, res) => {
     try {
          const { email } = req.body;
          const user = await User.findOne({ email }).select("-password");
          await Code.findOneAndRemove({ user: user._id });
          const code = generateCode(5);
          const savedCode = await new Code({
            code,
            user: user._id,
          }).save();
          sendResetCode(user.email, user.first_name, code);
          return res.status(200).json({
            message: "Email reset code has been sent to your email",
          });
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
});
//send verifications
const sendVerification=asyncHandler(async (req,res)=>{
     try {
          const id = req.user.id;
          const user = await User.findById(id);
          if (user.verified === true) {
            return res.status(400).json({
              message: "This account is already activated.",
            });
          }
          const emailVerificationToken = generateToken(
            { id: user._id.toString() },
            "30m"
          );
          const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
          sendVerificationEmail(user.email, user.first_name, url);
          return res.status(200).json({
            message: "Email verification link has been sent to your email.",
          });
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
})
//validate reset password 
const validateResetPassword=asyncHandler(async (req,res)=>{
     try {
          const { email, code } = req.body;
          const user = await User.findOne({ email });
          const Dbcode = await Code.findOne({ user: user._id });
          if (Dbcode.code !== code) {
            return res.status(400).json({
              message: "Verification code is wrong..",
            });
          }
          return res.status(200).json({ message: "ok" });
     } catch (error) {
     res.status(500).json({ message: error.message });
     }
})
//change password 
const changePassword=asyncHandler(async (req,res)=>{
     const { email, password } = req.body;
     const cryptedPassword = await bcrypt.hash(password, 12);
     await User.findOneAndUpdate(
     { email },
     {password: cryptedPassword,}
     );
     return res.status(200).json({ message: "ok" });
})
   


module.exports={
createUser,
logOut,
loginAdmin,
deleteUser,
getAllUsers,
login,
getUser,
updateUser,
activeAccount,
blockUser,
updatePassword,
unblockUser,
handleRefreshTokens,
}