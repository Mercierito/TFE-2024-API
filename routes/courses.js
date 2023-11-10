const express=require('express')
const router= express.Router()
const Joi= require('joi')
const config=require('config')
const sequelize=require('../dbConnection')
const {Course}=require('../models/course')
const bcrypt=require('bcrypt')
const{Op}=require('sequelize')

router.post('/',async(req,res)=>{
    try{
        const nexCourse=await Course.create({
            name: req.body.name,
            reheatInfo: req.body.name,
            price : req.body.price,
        })
        res.status(201).send(nexCourse)
    }catch(error){
        console.error('Error : ',error)
        res.status(500).send('Internal Server Error')
    }
})

router.get('/',async(req,res)=>{
    try{
        const courses=await Course.findAll({
            where:{
                id:{
                    [Op.not]:0
                }
            }
        })
        res.status(200).send(courses)
    }catch(error){
        console.error('Error : ',error)
        res.status(500).send('Internal Server Error')
    }
})

module.exports=router;