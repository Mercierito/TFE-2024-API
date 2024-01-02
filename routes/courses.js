const express=require('express')
const router= express.Router()
const Joi= require('joi')
const config=require('config')
const sequelize=require('../dbConnection')
const {Course}=require('../models/course')
const bcrypt=require('bcrypt')
const{Op}=require('sequelize')
const auth=require('../middleware/auth')

router.post('/',auth,async(req,res)=>{
    try{
        console.log(req.body)
        const nextCourse=await Course.create({
            name: req.body.name,
            reheatInfo: req.body.reheatInfo,
            price : req.body.price,
        })
        res.status(201).send(nextCourse)
    }catch(error){
        console.error('Error : ',error)
        res.status(500).send('Internal Server Error')
    }
})

router.get('/',auth,async(req,res)=>{
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