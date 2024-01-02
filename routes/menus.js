const express=require('express')
const router= express.Router()
const Joi= require('joi')
const config=require('config')
const sequelize=require('../dbConnection')
const {Menu}=require('../models/menu')
const bcrypt=require('bcrypt')
const auth=require('../middleware/auth')

router.get('/',auth,async(req,res)=>{
    try{
        const courses=await Menu.findAll()
        res.status(200).send(courses)
    }catch(error){
        console.error('Error : ',error)
        res.status(500).send('Internal Server Error')
    }
})

module.exports=router;