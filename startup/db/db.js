const sqlite3 = require('sqlite3').verbose();
const queries = require('./queries');

const init = (db) => {
    db
        .run(queries.createDepartments, (err) => { if (err) console.log(`Error creating table for departments: ${err}`) })
        .run(queries.createInstructors, (err) => { if (err) console.log(`Error creating table for instructors: ${err}`) })
        .run(queries.createStudents, (err) => { if (err) console.log(`Error creating table students: ${err}`) });
}

module.exports.db = () => {
    const db = new sqlite3.Database(':memory:', (err) => {
        if (err) { return console.log("Error connecting to SQLite Database.") };
        console.log("Connected to the SQLite database");
    });
    init(db);
    return db;
}