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
    console.log('enteting')
    console.log(req.body)
    console.log(!password)
    
    if(!mail||!password||password===''){
        console.log('in if')
        return res.status(400).send('Bad Request')}

    try{
        console.log('in try too')
        const user=await User.findOne({
        
            where:{
                mail : mail
            }
        })
        console.log(user)
    
        if(!user){
            console.log('user found')
            return res.status(404).json({message :'User not found or Incorrect password'})
        }
    
        const passwordMatch=await bcrypt.compare(password,user.password)
    
        if(!passwordMatch){
            return res.status(401).json({message:'User not found or Incorrect password'})
        }
    
        const token=user.generateJWT()
    
        return res.status(200).header('x-auth-token',token).send(_.pick(user,['id','name']))
    }catch(error){

    }

    
})

module.exports =router;