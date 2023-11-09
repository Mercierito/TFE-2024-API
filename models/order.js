const {DataTypes,Model}=require('sequelize')
const sequelize = require('../dbConnection')

class Order extends Model{}

Order.init({
    id:{
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    orderNumber:{
        type:DataTypes.INTEGER
    },
    userId:{
        type:DataTypes.INTEGER,
        references:{
            model:'user',
            key:'id',
            deferrable:Sequelize.Deferrable.INITIALLY_IMMEDIATE,
            onDelete:'CASCADE',
            onUpdate:'CASCADE'
        }
    },
    content:{
        type:DataTypes.ARRAY(DataTypes.INTEGER)
    },
    contentFromMenu:{
        type:DataTypes.ARRAY(DataTypes.INTEGER)
    },
    date:{
        type: DataTypes.DATE
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
    },
    menuQuantity:{
        type:DataTypes.INTEGER
    }
},{
    sequelize,
    modelName:'Order',
    tableName:'orders',
    timestamps:false
})

module.exports={Order}