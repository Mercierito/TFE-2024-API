var dbm
var type
var seed 

exports.setup=function(options,seedLink){
    dbm=options.dbmigrate
    type=dbm.dataType
    seed=seedLink
}

exports.up=function(db){
    return db.createTable('courses',{
        id:{type:'int',primaryKey: true,autoIncrement: true},
        name:'string',
        reheatInfo:'string',
        price:'int',
        
    })
}