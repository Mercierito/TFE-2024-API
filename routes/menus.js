const express=require('express')
const router= express.Router()

const {Menu}=require('../models/models')

const auth=require('../middleware/auth')
const { vi } = require('date-fns/locale')

router.get('/',async(req,res)=>{
    try{
        const courses=await Menu.findAll()
        res.status(200).send(courses)
    }catch(error){
        console.error('Error : ',error)
        res.status(500).send('Internal Server Error')
    }
})
router.get('/visible', async(req,res)=>{
    try{
        const courses=await Menu.findAll({
            where:{
                visibility:true
            }
        })

        res.status(200).send(courses)
    }catch(error){
        console.error(error)
        res.status(500).send('Internal server error')
    }
})

router.patch('/',async(req,res)=>{
    try{
        const menuToModify=await Menu.findOne({
            where:{
                id:req.body.id
            }
        })
        if(!menuToModify){
            return res.status(404).send("menu not found")
        }
        const newValue=!menuToModify.visibility
        const updatedMenu=await menuToModify.update({
            visibility:newValue
        })

        res.status(200).send(updatedMenu)


    }catch(error){
        console.error(error)
        res.status(500).send('internal server error')
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