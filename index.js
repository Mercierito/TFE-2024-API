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

const dbmigrate = DBMigrate.getInstance(true, {
    config: dbConfig,
    cmdOptions: {
      'migrations-dir': './migrations' // adjust path if necessary
    }
  });

  dbmigrate.up().then(() => {
    console.log('Migrations complete.')});

    

app.use(express.json())
app.use('/api/users',users)
app.use('/api/workers',workers)
app.use('/api/menus/',menus)
app.use('/api/orders/',orders)
app.use('/api/courses/',courses)
app.use('/api/bills',bills)

/*app.get('/',async (req,res)=>{
    const client = await pool.connect();
    //client.port
   
    client.release();
    
    res.send('Seems ok');
})*/

app.get('/api/test',(req,res)=>{
    res.send(['test',1,2])
}
)

app.get('/api/conf',(req,res)=>{
    res.send(config.name)
})




const port =process.env.PORT||3000
app.listen(port,()=>console.log(`Listening on port ${port}`));