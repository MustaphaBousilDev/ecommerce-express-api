const express=require('express')
const app=express()
const dotenv=require('dotenv').config()
//get db connection from config/dbConnect.js
const dbConnect=require('./config/dbConnect')
const authRouter=require('./router/authRoute')
const bodyParser = require('body-parser')
const PORT=process.env.PORT || 4000
dbConnect
//connect to db
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/api/user',authRouter)


app.listen(PORT,()=>{
     console.log(`Server is running on port ${PORT}`)
})