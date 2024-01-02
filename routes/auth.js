const express=require('express')
const router= express.Router()
const bcrypt=require('bcrypt')
const _=require('lodash')

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

    const token=worker.generateJWT()

    return res.status(200).header('x-auth-token',token).send(_.pick(worker,['id','name','role']))

    
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

    const token=user.generateJWT()

    return res.status(200).header('x-auth-token',token).send(_.pick(user,['id','name']))
})

module.exports =router;