var dbm
var type
var seed 

exports.setup=function(options,seedLink){
    dbm=options.dbmigrate
    type=dbm.dataType
    seed=seedLink
}

exports.up=function(db){
    return db.createTable('menus',{
        id:{type:'int',primaryKey: true,autoIncrement: true},
        options: 'int[][]',
        price:'int'
    })
    .then(function () {
        // Create a trigger to enforce the constraint
        return db.runSql(`
        CREATE OR REPLACE FUNCTION validate_menu_options()
        RETURNS TRIGGER AS $$
        DECLARE
          option INT;
        BEGIN
          -- Iterate over each row in 'options' array
          FOR option IN SELECT unnest(NEW.options)
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
        CREATE TRIGGER validate_menu_options_trigger
        BEFORE INSERT OR UPDATE ON menus
        FOR EACH ROW
        EXECUTE FUNCTION validate_menu_options();`
        );
    });
}