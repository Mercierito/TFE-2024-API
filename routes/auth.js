const express=require('express')
const router= express.Router()
const bcrypt=require('bcrypt')

const {Worker}=require('../models/worker')
const {User}=require('../models/user')

router.post('/worker',async(req,res)=>{

    const{name,password}=req.body

    if(!name||!password){
        return res.status(400).send('Bad request, no body')
    }


    const worker=await Worker.findOne({
        where:{
            name: name.trim()
        }
    })

    if(!worker){
        return res.status(401).json({message: 'Incorrect username or password'})
    }
    const passwordMatch=await bcrypt.compare(password,worker.password)
    if(!passwordMatch){
        return res.status(401).json({message:'Incorrect username or password'})
    }

    return res.status(200).json(worker.generateJWT())

    
})

router.post('/user',async(req,res)=>{
    const {mail,password}=req.body
    
    if(!mail||!password)return res.status(400)

    const user=await User.findOne({
        where:{
            mail : mail
        }
    })

    if(!user){
        return res.status(401).json({message :'User not found'})
    }

    const passwordMatch=await bcrypt.compare(password,user.password)

    if(!passwordMatch){
        return res.status(401).json({message:'Incorrect password'})
    }

    return res.status(200).json(user.generateJWT())
})

module.exports =router;