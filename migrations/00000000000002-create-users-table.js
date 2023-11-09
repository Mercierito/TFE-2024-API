var dbm
var type
var seed 

exports.setup=function(options,seedLink){
    dbm=options.dbmigrate
    type=dbm.dataType
    seed=seedLink
}

exports.up=function(db){
    return db.createTable('users',{
        id:{type:'int',primaryKey: true,autoIncrement: true},
        mail: 'string',
        name:'string',
        password:'string',
        tva:'string',
        pub:'boolean',
        phoneNumber:'string',
        address:'string'
    })
}