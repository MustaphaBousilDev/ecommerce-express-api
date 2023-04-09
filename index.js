const express=require('express')
const app=express()
const mongoose=require('mongoose')
const dotenv=require('dotenv').config()
//get db connection from config/dbConnect.js
require('./config/dbConnect')
const authRouter=require('./router/authRoute')
const bodyParser = require('body-parser')
const { notFound, errorHandler } = require('./middleware/errorHandler')
const PORT=process.env.PORT || 4000

//connect to db
app.use(bodyParser.json())
//this is for form data 
app.use(bodyParser.urlencoded({ extended: false }))



app.use('/api/user',authRouter)
//this is for not found
app.use(notFound)
//this is for error handler
app.use(errorHandler)

app.listen(PORT,()=>{
     console.log(`Server is running on port ${PORT}`)
})