const jwt=require('jsonwebtoken')

const refreshTokens=(id)=>{
    return jwt.sign({id},process.env.SECRET_KEY_TOKEN,{expiresIn:"3d"})
}


module.exports={refreshTokens}