const {DataTypes,Model}=require('sequelize')
const sequelize=require('../dbConnection')

class Menu extends Model{}

Menu.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING
    },
    options:{
        type:DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.INTEGER))
    },
    price:{
        type:DataTypes.INTEGER
    },
    visibility:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }
},{
    sequelize,
    modelName:'Menu',
    tableName:'menus',
    timestamps:false
})

module.exports={Menu}