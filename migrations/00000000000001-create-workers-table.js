var dbm
var type
var seed 

exports.setup=function(options,seedLink){
    dbm=options.dbmigrate
    type=dbm.dataType
    seed=seedLink
}

exports.up=function(db){
    return db.createTable('workers',{
        id:{type:'int',primaryKey: true,autoIncrement: true},
        name:'string',
        password:'string',
        role:'int'
    })
}