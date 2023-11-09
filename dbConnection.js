const {Sequelize}=require('sequelize')


    const sequelize=new Sequelize('postgres://postgres:postgres@localhost:2022/postgres')
    
   

    module.exports=sequelize