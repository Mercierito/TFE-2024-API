const express=require('express')
const router=express.Router()
const Joi=require('joi')

const{User}=require('../models/models')
const bcrypt=require ('bcryptjs')
const _=require('lodash')
const auth=require('../middleware/auth')
const transporter=require('../nodemail')
const authMiddleware=require('../middleware/authMiddleware')

router.get('/',authMiddleware.auth,async(req,res)=>{

    try{
        const users=await User.findAll()        
        
        res.status(200).send(users)
    }catch(error){
        console.error('Error : ',error)
        res.status(500).send('Internal server errror')
    }
    
    
})



router.post('/',async(req,res)=>{   

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

router.put('/',async(req,res)=>{
    console.log(req.body)

    try{
        console.log("before user.findone for existing user")
        const existingUser=await User.findOne({
            where:{
                name:req.body.nom,
                mail:req.body.email,
                address:`${req.body.adresse},${req.body.codePostal},${req.body.ville}`
            }
        })
        

        var password

        if(req.body.password){
            console.log("start bcrypt")
             password=await bcrypt.hash(req.body.password,10)
        }else{
            return res.status(400).send('Bad request')
        }
        console.log("after bcrypt")
        
        if(existingUser){
            console.log("inside if(existingUser)")
            if(existingUser.password.length >0){

                console.log("modify existing user start")
                            

                    const updatedUser=await existingUser.update({
                        mail:req.body.email,
                        password:password,
                        pub:req.body.acceptPub,
                        tva:req.body.tva,
                        name:req.body.nom,
                        address:`${req.body.adresse},${req.body.codePostal},${req.body.ville}`,
                        phoneNumber: req.body.telephone
                    })
                    console.log("after updating")

                    const token=existingUser.generateJWT()
                    console.log('TOKEN: ',token)

                    res.status(201).header('x-auth-token',token).send(_.pick(updatedUser,['id','mail','name']))
                
            }else{
                return res.status(409).send('User already exists')
            }
        }else{
            console.log("Else create newUser")
            const newUser=await User.create({
                mail:req.body.email,
                password:password,
                pub:req.body.acceptPub,
                tva:req.body.tva,
                name:req.body.nom,
                address:`${req.body.adresse},${req.body.codePostal},${req.body.ville}`,
                phoneNumber: req.body.telephone
            })

            
            const token=newUser.generateJWT()
            console.log('TOKEN: ',token)

            return res.status(201).header('x-auth-token',token).send(_.pick(newUser,['id','mail','name']))
        }



    }catch(error){
        console.error(error)
        return res.status(500).send("internal server error")

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
            ...(user.tva && { tva: user.tva }),  
        };
        return res.status(200).send(responseData)

        

    }catch(error){
        console.error('Error: ',error)
        res.status(500).send('Internal Server Error')
    }

    
})




router.patch('/me',auth,async(req,res)=>{

    console.log('BODY: ',req.body)

    try{

        var user = await User.findByPk(req.decodedToken.id);
      

        // Check if the user was found
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Update individual fields based on the request body
        if (req.body.nom) {
            user.name= req.body.nom;
           
        }
        if (req.body.email) {
            user.mail = req.body.email;
        }
        if(req.body.tva){
            user.tva=req.body.tva
        }
        if(req.body.telephone){
            console.log('PHONE NUM: ',typeof(req.body.telephone))
            user.phoneNumber=req.body.telephone
        }
        if(req.body.adresse){
            user.address=`${req.body.adresse},${req.body.codePostal},${req.body.ville}`
        }
        if(req.body.password!==''){
            var  password=await bcrypt.hash(req.body.password,10)
            user.password=password
        }
        if(req.body.acceptPub!==null){
            user.pub=req.body.acceptPub
            console.log('USER Pub: ',user.pub)
        }

        console.log('Before save: ',user)
        
        await user.save();
        
        

        console.log('Updated User',user)
        return res.status(200).json(user);
        

    }catch(error){
        console.log(error)
        return res.status(500).send('Internal server error')
    }
    
    
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