const{DataTypes,Model}=require('sequelize')
const sequelize=require('../dbConnection')
const jwt=require('jsonwebtoken')

class Worker extends Model{

    generateJWT(){

        const token=jwt.sign({id:this.id,isWorker:true,role:this.role},'privateKey')
        return token;
    }
}

Worker.init({
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
},{
    sequelize,
    tableName:"workers",
    modelName:'Woker',
    timestamps:false
})

module.exports={Worker}