const jwt=require('jsonwebtoken')

const generateToken=(payload,expired)=>{
     return jwt.sign({payload},process.env.SECRET_KEY_TOKEN,{
          expiresIn:expired
     })

}

module.exports={generateToken}