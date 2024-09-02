const express=require('express');
const Joi=require('joi');
const config=require('config')
const app= express();
const {Pool}=require('pg')
const DBMigrate=require('db-migrate')
const dbConfig=require('./dbConfig')

const users=require('./routes/users')
const workers=require('./routes/workers')
const menus=require('./routes/menus')
const orders=require('./routes/orders')
const courses=require('./routes/courses')
const bills=require('./routes/bills')
const auth=require('./routes/auth')
const cors=require('cors')
const{sequelize, Worker}=require('./models/models')
const bcrypt=require('bcryptjs')


    sequelize.sync({alter:true})
    .then(async() => {
      console.log('Database synchronized.');

      const workerCount=await Worker.count()
      if(workerCount===0){
        const hshedPassword=await bcrypt.hash('Test123*',10)
        await Worker.create({
          name:'Admin',
          password:hshedPassword,
          role:10
        })
        console.log('Default User created')
      }
      
      
    })
    .catch((error) => {
      console.error('Error synchronizing database:', error);
    });

    
app.use(cors({
  origin:'*',
  methods:'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials:true,
  exposedHeaders:['x-auth-token']
}))
app.use(express.json({limit:'10mb'}))
app.use('/api/auth',auth)
app.use('/api/users',users)
app.use('/api/workers',workers)
app.use('/api/menus/',menus)
app.use('/api/orders/',orders)
app.use('/api/courses/',courses)
app.use('/api/files',bills)



app.get('/api/test',(req,res)=>{
    res.send(['test',1,2])
}
)

app.get('/api/conf',(req,res)=>{
    res.send(config.name)
})



/*const options={
  key: fs.readFileSync('./certs/localhost-key.pem'),
  cert: fs.readFileSync('./certs/localhost-cert.pem')
}*/

const port =process.env.PORT||7864
const dburl=process.env.DATABASE_URL||"env varible unknown"
app.listen(port,()=>console.log(`Listening on port ${port} and DB URL is ${dburl}`));


/*async function startServer(){
  const server=https.createServer(options, app).listen(port,()=>{
    console.log(`HTTPS server running on https://localhost:${port}`)
  })
  
  const tunnel= await localtunnel({port,subdomain:'nic-dhaese'})
  console.log(`Localtunnel URL: ${tunnel.url}`)
  
  tunnel.on('close',()=>{
    console.log('Localtunnel closed')
  })

}

startServer()*/

