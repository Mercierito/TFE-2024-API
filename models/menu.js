const {DataTypes,Model}=require('sequelize')
const sequelize=require('../dbConnection')

class Menu extends Model{}

Menu.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },  
    options:{
        type:DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.INTEGER))
    },
    price:{
        type:DataTypes.INTEGER
    } 
},{
    sequelize,
    modelName:'Menu',
    tableName:'menus',
    timestamps:false
})

module.exports={Menu}