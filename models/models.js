const {DataTypes, Sequelize}=require('sequelize')
const jwt=require('jsonwebtoken')

const sequelize=new Sequelize({
    dialect:'postgres',
    host:'localhost',
    port:2022,
    username:'postgres',
    password:'postgres',
    logging:false,
    define:{
        timestamps:false
    }
})

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
