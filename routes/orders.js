const express=require('express')
const router= express.Router()
const Joi= require('joi')
const config=require('config')
const sequelize=require('../dbConnection')
const {Order}=require('../models/order')
const {User}=require('../models/user')
const transporter=require('../nodemail')
//const bcrypt=require('bcrypt')

router.get('/',async(req,res)=>{
    try{
        const orders=await Order.findAll()
        res.status(200).send(orders)
    }catch(error){
        console.log('Error : ',error)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/',async(req,res)=>{
    try{
        const{client,content,contentFromMenu,menus,status,date,address,type}=req.body
        console.log(Date.parse(date))
        const newOrder=await Order.create({
            userId:client,
            content:content,
            contentfrommenu:contentFromMenu,
            menu:menus,
            status:status,
            date:date,
            address:address,
            type:type
        })

        res.status(201).json(newOrder)

    }catch(error){
        console.log('Error ',error)
        res.status(500).send('Internal server error')
    }
})

router.patch('/status',async(req,res)=>{

    const statuses={
        0:'en attente',
        1:'acceptée',
        2:'en cours de préparation',
        3:'terminée',
        4:'reçue par le client'
    }

    try{
        const order=await Order.findOne({
            where:{
                id:req.body.id
            }
        })
        if(order){
            order.status=req.body.status
            await order.save()
            console.log('Order Status updated')
            console.log(`La commande est maintenant ${statuses[order.status]}`)
            
            try{
                const user=await User.findOne({
                    where:{
                        id:order.userId
                    }
                })
                const to=user.mail
                const message={
                    
                    to,
                    subject:`Votre commande ${order.orderNumber} a changé de statut`,
                    html:`
                    <h3>Votre commande a changé de statut</h3>
                    <p>Votre commande est maintenant ${statuses[order.status]}</p>
                    <p>Ce mail a été généré automatiquement, veuillez ne pas y répondre</p>
                    `
                }
                const info= await transporter.sendMail(message)
                console.log('Mail sent ', info.messageId)

            }catch(error){
                console.error('Error sending mail ',error)

            }
            res.status(200).send(order)
        }
        else{
            consolee.log('order not found')
            return res.status(404).send('Order not found')
        }
    }catch(error){
        console.error('Error updating status ', error)
        res.status(500).send('Internal Server Error')
    }
})


module.exports=router;