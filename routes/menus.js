const express=require('express')
const router= express.Router()

const {Menu}=require('../models/models')

const auth=require('../middleware/auth')

router.get('/',async(req,res)=>{
    try{
        const courses=await Menu.findAll()
        res.status(200).send(courses)
    }catch(error){
        console.error('Error : ',error)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/',auth,async(req,res)=>{
    try{
        const{name,options,price}=req.body
        console.log(req.body)
        const nextMenu=await Menu.create({
            name:name,
            options:options,
            price:price
        })
res.status(201).send(nextMenu)

    }catch(error){
        console.log('Error ',error)
        res.status(500).send('Internal Server Error')
    }
})

module.exports=router;