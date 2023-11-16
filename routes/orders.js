const express=require('express')
const router= express.Router()
const Joi= require('joi')
const config=require('config')
const sequelize=require('../dbConnection')
const {Order}=require('../models/order')
const bcrypt=require('bcrypt')

router.get('/',async(req,res)=>{
    try{
        const orders=await Order.findAll()
        res.status(200).send(orders)
    }catch(error){
        console.log('Error : ',error)
        res.status(500).send('Internal Server Error')
    }
})

//get ID

router.post('/',async (req,res)=>{
    try{
        const newCourse=await Course.create({
            name:req.body.name
        })

    }catch(error){
        console.log('Error : ',error)
        resizeTo.status(500).send('Internal Server Error')
    }
})

module.exports=router;