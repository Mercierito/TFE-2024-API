const express=require('express')
const router= express.Router()
const Joi= require('joi')
const config=require('config')
const sequelize=require('../dbConnection')
const {Worker}=require('../models/worker')
const bcrypt=require('bcrypt')

router.get('/',async(req,res)=>{
    try{
        const users=await Worker.findAll()
        res.json(users)
    }catch(error){
        console.error('Error : ',error)
        res.status(500).send('Internal server error')
    }
})


router.post('/',async(req,res)=>{
    const{error}=ValidateWorker(req.body)
    if(error)return res.status(400).send(error.details[0].message)

    try{
        var hashedPassword=await bcrypt.hash(req.body.password,10)
        const newWorker=await Worker.create({
            name:req.body.name,
            password:hashedPassword,
            role:req.body.role
        })
        res.status(201).json(newWorker)
    }catch(error){
        console.error('Error : ', error)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/login',async(req,res)=>{
    const{name,password}=req.body


    const worker=await Worker.findOne({
        where:{
            name: name.trim()
        }
    })

    if(!worker){
        return res.status(404).json({message: 'Worker not found'})
    }
    const passwordMatch=await bcrypt.compare(password,worker.password)
    if(!passwordMatch){
        return res.status(401).json({message:'Incorrect password'})
    }

    return res.status(200).json(worker.id)
})



function ValidateWorker(worker){
    const schema=Joi.object({
        name:Joi.string().required(),
        password:Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, 'password').message('Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character'),
        role:Joi.number().required()
    })
    return schema.validate(worker)
}

module.exports=router;