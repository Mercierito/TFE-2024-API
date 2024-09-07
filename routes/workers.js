const express=require('express')
const router= express.Router()
const Joi= require('joi')
const config=require('config')
const sequelize=require('../dbConnection')
const {Worker}=require('../models/models')
const bcrypt=require('bcryptjs')
const _=require('lodash')
const auth=require('../middleware/auth')
const role=require('../middleware/role')






router.get('/',[auth,role(0)],async(req,res)=>{
    try{
        const users=await Worker.findAll()
        res.json(users)
    }catch(error){
        console.error('Error : ',error)
        res.status(500).send('Internal server error')
    }
})
router.get('/me',auth,async(req,res)=>{
    try{
        var worker = await Worker.findByPk(req.decodedToken.id)
        const responseData={
            ..._.pick(worker,['name','role'])
        }
        return res.status(200).send(responseData)
    }catch(error){
        console.error('Error: ',error)
        res.status(500).send('Internal Server Error')
    }
})

router.patch('/me',auth,async(req,res)=>{
    try{
        console.log(req.body)
        var worker = await Worker.findByPk(req.decodedToken.id)
        if(!worker){
            return res.status(404).send('User not found')
        }
        if(req.body.nom){
            worker.name=req.body.nom
        }
        await worker.save()
        return res.status(200).json(worker)
    }catch(error){
        return res.status(500).send('Internal Server Error')        
    }
})

router.patch('/me/password',auth,async(req,res)=>{
    try{
        const {currentPassword, newPassword}=req.body
        if(!currentPassword||!newPassword){
            return res.status(400).send('Current and new password required')
        }
       
        var worker=await Worker.findByPk(req.decodedToken.id)
        if(!worker) return res.status(404).send('User not found')

        const isMatch=await bcrypt.compare(currentPassword,worker.password)
        if(!isMatch) return res.status(400).send('Incorrect current password')

        if(newPassword.length<8){
            return res.status(400).send('New password must be at least 8character long')
        }
        
        const hashedPassword=await bcrypt.hash(newPassword,10)
        worker.password=hashedPassword
        await worker.save()
        return res.status(200).send('Password updated successfully')
        

    }catch(error){
        return res.status(500).send('Internal server error')
    }
})


router.post('/',async(req,res)=>{
    const{error}=ValidateWorker(req.body)
    if(error)return res.status(400).send(error.details[0].message)

    try{
        var hashedPassword=await bcrypt.hash(req.body.password,10)
        
        const newWorker=await Worker.create({
            name:req.body.name,
            password:hashedPassword,
            role:req.body.role
        })
        console.log(newWorker)
        //const token=newWorker.generateJWT()
        res.status(201).json(_.pick(newWorker,['id','name','role']))
    }catch(error){
        console.error('Error : ', error)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/login',async(req,res)=>{
    const{name,password}=req.body


    const worker=await Worker.findOne({
        where:{
            name: name.trim()
        }
    })

    if(!worker){
        return res.status(404).json({message: 'Worker not found'})
    }
    const passwordMatch=await bcrypt.compare(password,worker.password)
    if(!passwordMatch){
        return res.status(401).json({message:'Incorrect password'})
    }

    return res.status(200).json(worker.id)
})

router.delete('/',auth,async(req,res)=>{

    try{
    console.log(req.body.workerId)
    const workerToDelete=await Worker.findByPk(req.body.workerId)

    if(!workerToDelete)return res.status(404).send('Worker not found')

    await Worker.destroy({
        where:{id:req.body.workerId}
    })
    return res.status(200).send("Worker deletion successful")

    }catch(e){
        console.error(e)
        return res.status(500).send('Internal server error')
    }    
})

router.patch('/up',auth,async(req,res)=>{
    try{
        const workerToUpRole=await Worker.findByPk(req.body.workerId)
        if(!workerToUpRole)return res.status(404).send('worker not found')
        
        var newRole=workerToUpRole.role+1
        if(newRole>3)newRole=3
        const updatedWorker=await workerToUpRole.update({
            role:newRole
        })

        return res.status(201).send(updatedWorker)
    }catch(e){
        console.error(e)
        return res.status(500).send('Internal server error')
    }
})

router.patch('/down',auth,async(req,res)=>{
    try{
        const workerToUpRole=await Worker.findByPk(req.body.workerId)
        if(!workerToUpRole)return res.status(404).send('worker not found')
        
        var newRole=workerToUpRole.role-1
        if(newRole<0)newRole=0
        const updatedWorker=await workerToUpRole.update({
            role:newRole
        })

        return res.status(201).send(updatedWorker)
    }catch(e){
        console.error(e)
        return res.status(500).send('Internal server error')
    }
})



function ValidateWorker(worker){
    const schema=Joi.object({
        name:Joi.string().required(),
        password:Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, 'password').message('Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character'),
        role:Joi.number().required()
    })
    return schema.validate(worker)
}

module.exports=router;