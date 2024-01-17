const express=require('express')
const router=express.Router()
const Joi=require('joi')
const config=require('config')
const sequelize=require('../dbConnection')
const{User}=require('../models/user')
const bcrypt=require ('bcrypt')
const _=require('lodash')
const auth=require('../middleware/auth')
const transporter=require('../nodemail')

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
    console.log('PASSWORD: ',password)

    try{
        
        const newUser=await User.create({
            mail:req.body.email,
            password:password,
            pub:req.body.acceptPub,
            tva:req.body.tva,
            name:req.body.nom,
            address:`${req.body.adresse},${req.body.codePostal},${req.body.ville}`,
            phoneNumber: req.body.telephone
            
        });

        const token=newUser.generateJWT()
        console.log('TOKEN: ',token)

        res.status(201).header('x-auth-token',token).send(_.pick(newUser,['id','mail','name']))

    }catch(error){ 
        console.error('Error: ',error)
        res.status(500).send('Internal Server Error')
    }
    
    
})

router.get('/me',auth,async(req,res)=>{


    try{
        const user=await User.findOne({
            where:{
                id:req.decodedToken.id
            }
        })
        const responseData = {
            ..._.pick(user, ['mail', 'name', 'address','phoneNumber','pub']),
            ...(user.tva && { tva: user.tva }),  // Include 'tva' only if it exists in the user object
        };
        return res.status(200).send(responseData)

        

    }catch(error){
        console.error('Error: ',error)
        res.status(500).send('Internal Server Error')
    }

    
})




router.patch('/update/me',auth,async(req,res)=>{

    
    
    return res.status(200)
})

router.post('/sendAd',auth,async(req,res)=>{
    console.log('got hit')
    console.log(req.body.text)
    console.log(req.body.file)

    try{
    
        const users=await User.findAll({
            where:{
                pub:true
            }
        })
        const message={
            
            subject:req.body.object,
            html:`
            <p>${req.body.text}</p>
            `
        }   
        if(req.body.file){
            const fileContent=Buffer.from(req.body.file,'base64')      
            message.attachments=[{
                filename:req.body.fileName,
                content:fileContent,
                encoding:'base64'
            }]
        }     

        for(const user of users){
            const to=user.mail  
            message.to=to        
            
            const info=await transporter.sendMail(message)
            console.log('Mail sent to: ',user.name)
        }
        res.status(200).send("All mail sent")
    }catch(error){
        console.error(error)
        res.status(500).send('Internal server Error')
    }   
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