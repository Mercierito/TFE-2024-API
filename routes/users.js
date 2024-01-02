const express=require('express')
const router=express.Router()
const Joi=require('joi')
const config=require('config')
const sequelize=require('../dbConnection')
const{User}=require('../models/user')
const bcrypt=require ('bcrypt')
const _=require('lodash')
const auth=require('../middleware/auth')

router.get('/',auth,async(req,res)=>{

    try{
        const users=await User.findAll()
        
        
        res.status(200).send(users)
    }catch(error){
        console.error('Error : ',error)
        res.status(500).send('Internal server errror')
    }
    
    
})



router.post('/',async(req,res)=>{

    //const {error}=ValidateUser(req.body)

    //if(error)return res.status(400).send(error.details[0].message)

    console.log(req.body)
    var password=''
    if(req.body.password){
        password=await bcrypt.hash(req.body.password,10)
    }

    try{
        
        const newUser=await User.create({
            mail:req.body.email,
            password:password,
            pub:req.body.acceptPub,
            tva:req.body.tva,
            name:req.body.name,
            address:`${req.body.adresse},${req.body.codePostal},${req.body.ville}`,
            phoneNumber: req.body.phoneNumber
            
        });

        const token=newUser.generateJWT()

        res.status(201).header('x-auth-token',token).send(_.pick(newUser,['id','mail','anme']))

    }catch(error){ 
        console.error('Error: ',error)
        res.status(500).send('Internal Server Error')
    }
    
    
})




router.patch('/update/me',auth,async(req,res)=>{

    
    
    return res.status(200)
})

function ValidateUser(user){
    const schema=Joi.object({
        email:Joi.string().email().required(),
        name:Joi.string().required(),
        //password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, 'password').message('Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character'),
        //phoneNumber:Joi.string().min(9).required()
    })

    

    return schema.validate(user)
}


module.exports=router;