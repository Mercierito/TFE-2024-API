var dbm
var type
var seed 

exports.setup=function(options,seedLink){
    dbm=options.dbmigrate
    type=dbm.dataType
    seed=seedLink
}

exports.up=function(db){
    return db.createTable('bills',{
        id:{type:'int',primaryKey: true,autoIncrement: true},
        billNumber:'string',
        orderId:{
            type:'int',
            foreignKey:{
                name:'bills_orderId_fk',
                table:'orders',
                rules:{
                    onDelete:'CASCADE',
                    onUpdate:'CASCADE'
                },
                mapping:'id'
            }
        },
        dateGenerated:{
            type:'string'
        }
    })
}