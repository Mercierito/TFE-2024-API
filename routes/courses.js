const express=require('express')
const router= express.Router()

const {Course}=require('../models/models')

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

router.get('/visible', async(req,res)=>{
    try{
        const courses=await Course.findAll({
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
        const menuToModify=await Course.findOne({
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

module.exports=router;