const{DataTypes,Model}=require('sequelize')
const sequelize=require('../dbConnection')
const jwt=require('jsonwebtoken')

class User extends Model{
    generateJWT(){

        const token=jwt.sign({id:this.id},'privateKey')
        return token;
    }
}

User.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    mail:{
        type: DataTypes.STRING,
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
},{
    sequelize,
    modelName:'User',
    tableName:'users',
    timestamps:false
})



module.exports={User}