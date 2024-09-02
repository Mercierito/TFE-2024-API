const {DataTypes, Sequelize}=require('sequelize')
require('dotenv').config()
const jwt=require('jsonwebtoken')

/*const DATABASE_URL = 'postgres://u4m94q6tklcsh6:pb981454cdcb898de75c3c3467b015174bd82238004bb6539da3cf52293cffa5c@cah8ha8ra8h8i7.cluster-czz5s0kz4scl.eu-west-1.rds.amazonaws.com:5432/daq21oupij3e69';

const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Change to `true` in production with a valid SSL certificate
      },
    },
    logging: false,
    define: {
      timestamps: false,
    },
  });*/

/*const sequelize=new Sequelize({
    dialect:'postgres',
    
    host:'localhost',
    port:2022,
    username:'postgres',
    password:'postgres',
    logging:false,
    define:{
        timestamps:false
    }
})*/

/*const DATABASE_URL=process.env.DATABASE_URL
console.log(DATABASE_URL)

const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: process.env.NODE_ENV === 'production', // SSL only required in production
        rejectUnauthorized: false, // Change to `true` in production with a valid SSL certificate
      },
    },
    logging: false,
    define: {
      timestamps: false,
    },
  });*/

  // Get the database URL from environment variables
const DATABASE_URL = process.env.DATABASE_URL;

// Determine if we are in production
const isProduction = process.env.NODE_ENV === 'production';

// Create a Sequelize instance with conditional SSL options
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: isProduction
      ? {
          require: true, // Enable SSL in production
          rejectUnauthorized: false // Change to true with a valid SSL certificate
        }
      : false // Disable SSL for local development
  },
  logging: false,
  define: {
    timestamps: false
  }
});

const Menu=sequelize.define('menus',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    options:{
        type:DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.INTEGER))
    },
    price:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    visibility:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }
})

const Bill=sequelize.define('bills',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    billNumber:{
        type: DataTypes.STRING,
        allowNull:false
    },
    orderId:{
        type:DataTypes.INTEGER        
    },
    dateGenerated:{
        type: DataTypes.TEXT
    }
})

const Course=sequelize.define('courses',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING
    },
    reheatInfo:{
        type:DataTypes.STRING
    },
    price:{
        type:DataTypes.INTEGER
    },
    visibility :{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }
})

const Order=sequelize.define('orders',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    orderNumber:{
        type:DataTypes.INTEGER
    },
    userId:{
        type:DataTypes.INTEGER        
    },
    content:{
        type:DataTypes.ARRAY(DataTypes.INTEGER)
    },
    contentfrommenu:{
        type:DataTypes.ARRAY(DataTypes.INTEGER)
    },
    menu:{
        type:DataTypes.ARRAY(DataTypes.INTEGER)
    },
    date:{
        type: DataTypes.DATEONLY
    },
    status:{
        type:DataTypes.INTEGER
    },
    address:{
        type:DataTypes.STRING
    },
    type:{
        type:DataTypes.INTEGER
    },
    price:{
        type:DataTypes.INTEGER
    }
})
const User=sequelize.define('users',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    mail:{
        type: DataTypes.STRING,
        unique:true,
        allowNull:false
    },
    name:{
        type: DataTypes.STRING,
        allowNull:false
    },
    password:{
        type: DataTypes.STRING,
        allowNull:false
    },
    tva:{
        type: DataTypes.STRING,
        allowNull:true
    },
    pub:{
        type: DataTypes.BOOLEAN,
        allowNull:false
    },
    phoneNumber:{
        type: DataTypes.STRING,
        allowNull:false
    },
    address:{
        type: DataTypes.STRING,
        allowNull:false
    }
})

const Worker=sequelize.define('workers',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
        unique:true,
        allowNull:false
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    },
    role:{
        type:DataTypes.STRING,
        allowNull:false
    }
})

Worker.prototype.generateJWT=function(){
    const token=jwt.sign({id:this.id,isWorker:true,role:this.role},'privateKey')
    return token;
}
User.prototype.generateJWT=function(){
    const token=jwt.sign({id:this.id,isWorker:false},'privateKey')
        return token;
}

Bill.belongsTo(Order,{foreignKey:'orderId'})
Order.belongsTo(User,{foreignKey:'userId'})



module.exports={
    Menu,
    Course,
    Worker,
    User,
    Bill,
    Order,
    sequelize
}
