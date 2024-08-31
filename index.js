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
const{sequelize}=require('./models/models')

/*const dbmigrate = DBMigrate.getInstance(true, {
    config: dbConfig,
    cmdOptions: {
      'migrations-dir': './migrations' // adjust path if necessary
    }
  });

  dbmigrate.up().then(() => {
    console.log('Migrations complete.')});*/

    sequelize.sync({alter:true})
    .then(async() => {
      console.log('Database synchronized.');
      const [results, metadata] = await sequelize.query(`
        SELECT
            ccu.column_name,
            tc.constraint_name,
            tc.constraint_type
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.constraint_column_usage AS ccu 
            ON tc.constraint_name = ccu.constraint_name
        WHERE 
            tc.table_name = 'users' AND
            tc.constraint_type = 'UNIQUE';
    `);

    console.log(results);
      // You can start your server or perform other actions here.
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




const port =process.env.PORT||7864
app.listen(port,()=>console.log(`Listening on port ${port}`));