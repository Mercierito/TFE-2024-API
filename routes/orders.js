const express=require('express')
const router= express.Router()
const {Order}=require('../models/order')
const {User}=require('../models/user')
const{Course}=require('../models/course')
const{Menu}=require('../models/menu')
const transporter=require('../nodemail')
const auth=require('../middleware/auth')
const {Op}=require('sequelize')
//const bcrypt=require('bcrypt')

router.get('/',auth,async(req,res)=>{
    try{
        

        const orders=await Order.findAll()
        res.status(200).send(orders)
    }catch(error){
        console.log('Error : ',error)
        res.status(500).send('Internal Server Error')
    }
})

router.get('/waiting',auth,async(req,res)=>{
    try{   
        

        const orders=await Order.findAll({where:{status:0}})
        res.status(200).send(orders)
    }catch(error){
        console.log('Error : ',error)
        res.status(500).send('Internal Server Error')
    }
})

router.get('/done',auth,async(req,res)=>{
    try{   
        

        const orders=await Order.findAll({where:{status:4}})
        res.status(200).send(orders)
    }catch(error){
        console.log('Error : ',error)
        res.status(500).send('Internal Server Error')
    }
})
router.get('/working',auth,async(req,res)=>{
    try{   
        

        const orders=await Order.findAll({where:{status:{
            [Op.not]:[0,4]
        }},
        order:[['orderNumber','ASC']]
    })
        res.status(200).send(orders)
    }catch(error){
        console.log('Error : ',error)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/history',auth,async(req,res)=>{
    try{
        console.log(req.body)
        const orders=await Order.findAll({where:{userId:req.body.userId},order:[['orderNumber','ASC']]})
        res.status(200).send(orders)
    }catch(error){
        console.log('Error: ',error)
        res.status(500).send('Internal Server Error')
    }
})



router.post('/',auth,async(req,res)=>{
    try{

        const lastOrder=await Order.findOne({
            order:[['id','DESC']]

        })
        const currentYear=new Date().getFullYear()
        var orderNumber=currentYear%100

        console.log('last 2 digit of year: ',orderNumber)

        if(lastOrder){

            const stringNumber=lastOrder.orderNumber.toString()
            
            if(stringNumber.includes(orderNumber.toString())){
                
                const splited=stringNumber.split(orderNumber.toString())
                
                orderNumber=orderNumber+(parseInt(splited[1])+1).toString()
                
            }else{
                orderNumber=orderNumber.toString()+"1"
                
            }
                      
            
            
        }else{
            orderNumber=orderNumber+"1"            
        }

        const{client,content,contentFromMenu,menus,status,date,address,type}=req.body
        console.log(req.body)        
        var price=0
        try{
            const Courses=await Course.findAll()
            const Menus=await Menu.findAll()
            content.forEach(id=>{                
                const course=Courses.find((course)=>course.id===id)                
                if(course){
                    price+=course.price
                }
            })
            
            menus.forEach(id=>{
                const menu=Menus.find(menu=>menu.id===id)
                if(menu){
                    price+=menu.price
                }
            })

            console.log('Prix de la commande: ', price)           

        }catch(error){
            console.log('Error : ',error)
        }

        const newOrder=await Order.create({
            userId:client,
            content:content,
            contentfrommenu:contentFromMenu,
            menu:menus,
            status:status,
            date:date,
            address:address,
            type:type,
            orderNumber:parseInt(orderNumber),
            price:price
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
        4:'reçue',
        10 : 'refusée'
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
                    ${order.status===10 ? '<p>Malheureusement nous ne pouvons pas accepter votre commande, n\'hésitez pas à nous contacter par téléphone pour trouver une solution' : ''}
                    ${order.status===3 && order.type===0? '<p>Votre commande vous attend dans notre chambre froide, vous pouvez venir l\'emporter dès maintenant</p>':''}
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