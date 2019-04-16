const queries = require('../db/queries');

module.exports.init = (db) => {
    db
        .run(queries.createDepartments, (err) => { if (err) console.log(`Error creating table for departments: ${err}`) })
        .run(queries.createInstructors, (err) => { if (err) console.log(`Error creating table for instructors: ${err}`) })
        .run(queries.createStudents, (err) => { if (err) console.log(`Error creating table students: ${err}`) });
}