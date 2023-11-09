const{DataTypes,Model}=require('sequelize')
const sequelize=require('../dbConnection')

class Worker extends Model{}

Worker.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
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
},{
    sequelize,
    tableName:"workers",
    modelName:'Woker',
    timestamps:false
})

module.exports={Worker}