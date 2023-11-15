const {DataTypes,Model}=require('sequelize')
const sequelize=require('../dbConnection')

class Bill extends Model{}

Bill.init({
    id:{
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    billNumber:{
        type: DataTypes.STRING
    },
    orderId:{
        type:DataTypes.INTEGER,
        references:{
            model:'order',
            key:'id',
            onDelete:'CASCADE',
            onUpdate:'CASCADE'
        }
    }
},{
    sequelize,
    modelName:'Bill',
    tableName:'bills',
    timestamps:false
})

module.exports={Bill}