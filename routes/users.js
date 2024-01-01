const express=require('express')
const router=express.Router()
const Joi=require('joi')
const config=require('config')
const sequelize=require('../dbConnection')
const{User}=require('../models/user')
const bcrypt=require ('bcrypt')

router.get('/',async(req,res)=>{

    try{
        const users=await User.findAll()
        res.json(users)
    }catch(error){
        console.error('Error : ',error)
        res.status(500).send('Internal server errror')
    }
    
    
})

//get Id

router.post('/',async(req,res)=>{

    //const {error}=ValidateUser(req.body)

    //if(error)return res.status(400).send(error.details[0].message)

    console.log(req.body)

    try{
        //var hashedPassword=await bcrypt.hash(req.body.password,10);
        const newUser=await User.create({
            mail:req.body.email,
            password:'',
            pub:req.body.acceptPub,
            tva:req.body.tva,
            name:req.body.nom,
            address:`${req.body.adresse},${req.body.codePostal},${req.body.ville}`,
            phoneNumber: req.body.telephone
        });

        res.status(201).json(newUser)

    }catch(error){ 
        console.error('Error: ',error)
        res.status(500).send('Internal Server Error')
    }
    
    
})

router.post('/login',async(req,res)=>{
    
    const {mail,password}=req.body
    
    

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

    return res.status(200).json({message:'Login successful'})
})


router.patch('/update/:id',async(req,res)=>{

    
    
    return res.status(200)
})

function ValidateUser(user){
    const schema=Joi.object({
        mail:Joi.string().email().required(),
        name:Joi.string().required(),
        //password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, 'password').message('Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character'),
        phoneNumber:Joi.string().min(9).required()
    })

    

    return schema.validate(user)
}


module.exports=router;