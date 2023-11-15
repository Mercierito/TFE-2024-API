const express=require('express')
const router= express.Router()
const Joi= require('joi')
const config=require('config')
const sequelize=require('../dbConnection')
const {Bill}=require('../models/bill')

router.get('/',async(req,res)=>{
    try{
        const bills=await Bill.findAll()
        res.status(200).send(bills)
    }catch(error){
        console.log('Error :', error)
        res.status(500).send('Internal Server Error')
    }
})

module.exports=router;