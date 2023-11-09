const {DataTypes,Model}=require('sequelize')
const sequelize=require('../dbConnection')

class Course extends Model{}

Course.init({
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
    }
},{
    sequelize,
    modelName:'Course',
    tableName:'courses',
    timestamps:false
})
module.exports={Course}