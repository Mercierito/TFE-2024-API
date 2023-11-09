var dbm
var type
var seed 

exports.setup=function(options,seedLink){
    dbm=options.dbmigrate
    type=dbm.dataType
    seed=seedLink
}

exports.up=function(db){
    return db.createTable('orders',{
        id:{type:'int',primaryKey: true,autoIncrement: true},
        orderNumber:'int',
        userId:{
            type:'int',
            foreignKey:{
                name:'orders_userId_fk',
                table:'users',
                rules:{
                    onDelete:'CASCADE',
                    onUpdate:'CASCADE'
                },
                mapping:'id'
            }
        },
        content:'int[]',
        contentfrommenu:'int[]',
        date:'timestamp',
        status:'int',
        address:'string',
        type:'int',
        price:'int',
        menuQuantity:'int'
    }).then(function () {
        // Create a trigger to enforce the constraint
        return db.runSql(`
        CREATE OR REPLACE FUNCTION validate_order_content()
        RETURNS TRIGGER AS $$
        DECLARE
          option INT;
        BEGIN
          -- Iterate over each row in 'options' array
          FOR option IN SELECT unnest(NEW.content)
          LOOP
            -- Check if the 'option' corresponds to a valid 'courses.id'
            IF NOT EXISTS (SELECT 1 FROM courses WHERE id = option) THEN
              RAISE EXCEPTION 'Invalid course id in menu options';
            END IF;
          END LOOP;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
  
        -- Create a trigger that fires before inserting or updating a row in the 'menus' table
        CREATE TRIGGER validate_order_content_trigger
        BEFORE INSERT OR UPDATE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION validate_order_content();`
        ).then(function () {
            // Create a trigger to enforce the constraint
            return db.runSql(`
            CREATE OR REPLACE FUNCTION validate_order_contentFromMenu()
            RETURNS TRIGGER AS $$
            DECLARE
              option INT;
            BEGIN
              -- Iterate over each row in 'options' array
              FOR option IN SELECT unnest(NEW.contentfrommenu)
              LOOP
                -- Check if the 'option' corresponds to a valid 'courses.id'
                IF NOT EXISTS (SELECT 1 FROM courses WHERE id = option) THEN
                  RAISE EXCEPTION 'Invalid course id in menu options';
                END IF;
              END LOOP;
              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
      
            -- Create a trigger that fires before inserting or updating a row in the 'menus' table
            CREATE TRIGGER validate_order_contentFromMenu_trigger
            BEFORE INSERT OR UPDATE ON orders
            FOR EACH ROW
            EXECUTE FUNCTION validate_order_contentFromMenu();`
            );
        });
    });
}