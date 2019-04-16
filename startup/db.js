const sqlite3 = require('sqlite3').verbose();

const tableNames = {
    department: "department",
    student: "student",
    section: "section",
    instructor: "instructor"
};

const deptColumns = {
    deptName: "deptName",
    building: "building",
    budget: "budget"
};

const instructorColumns = {
    id: "id",
    name: "name",
    salary: "salary"
};

const studentColumns = {
    id: "id",
    name: "name",
    total_credits: "total_credits"
};

const createDeptSql = `CREATE TABLE IF NOT EXISTS ${tableNames.department}(
        ${deptColumns.deptName} TEXT PRIMARY KEY NOT NULL,
        ${deptColumns.building} TEXT NOT NULL,
        ${deptColumns.budget} INTEGER NOT NULL
    );`

const createInstructorSql = `CREATE TABLE IF NOT EXISTS ${tableNames.instructor}(
        ${instructorColumns.id} INTEGER PRIMARY KEY NOT NULL,
        ${instructorColumns.name} TEXT NOT NULL,
        ${instructorColumns.salary} INTEGER NOT NULL
    );`

const createStudentsSql = `CREATE TABLE IF NOT EXISTS ${tableNames.student}(
        ${studentColumns.id} INTEGER PRIMARY KEY NOT NULL,
        ${studentColumns.name} TEXT NOT NULL,
        ${studentColumns.total_credits} INTEGER NOT NULL
    );`

function init(db) {
    db
        .run(createDeptSql, (err) => { if (err) console.log(`Error creating table for departments: ${err}`) })
        .run(createInstructorSql, (err) => { if (err) console.log(`Error creating table for instructors: ${err}`) })
        .run(createStudentsSql, (err) => { if (err) console.log(`Error creating table students: ${err}`) });
}

module.exports.db = function () {
    const db = new sqlite3.Database(':memory:', (err) => {
        if (err) { return console.log("Error connecting to SQLite Database.") };
        console.log("Connected to the SQLite database");
    });
    init(db);
    return db;
}