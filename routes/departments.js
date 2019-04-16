const router = require('express').Router();
const tables = require('../db/tables');
const db = require('../db/database').getDatabase();
const { validateDepartment, validateTeaches } = require('../db/models');

router.get("/", (req, res) => {
    const sqlQuery = `SELECT * FROM ${tables.tableNames.department}`;
    db.all(sqlQuery, (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occurred"
            });
        }
        res.send(rows);
    });
});

router.get("/:name", (req, res) => {
    // Adding COLLATE NOCASE makes the queries case insensitive.
    const sqlQuery = `SELECT * FROM ${tables.tableNames.department} WHERE ${tables.deptColumns.deptName} = ? COLLATE NOCASE`;
    db.get(sqlQuery, [req.params.name], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occurred"
            });
        }
        if (!rows) {
            return res.status(404).send({
                message: "A department with the requested name was not found."
            });
        }
        res.send(rows);
    });
});

router.get("/:name/instructors", (req, res) => {
    // Adding COLLATE NOCASE makes the queries case insensitive.
    const sqlQuery = `
    SELECT * FROM ${tables.tableNames.instructor} 
    WHERE ${tables.instructorColumns.department_name} = ? COLLATE NOCASE`

    db.get(sqlQuery, [req.params.name], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occurred"
            });
        }
        if (!rows) {
            return res.status(404).send({
                message: "Instructors for the requested department name could not be found."
            });
        }
        res.send(rows);
    });
});

router.get("/:name/students", (req, res) => {
    // Adding COLLATE NOCASE makes the queries case insensitive.
    const sqlQuery = `
    SELECT * FROM ${tables.tableNames.student}
    WHERE ${tables.studentColumns.department_name} = ? COLLATE NOCASE`

    db.get(sqlQuery, [req.params.name], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occurred"
            });
        }
        if (!rows) {
            return res.status(404).send({
                message: "Students for the requested department name could not be found."
            });
        }
        res.send(rows);
    });
});

router.post("/", (req, res) => {
    const { error } = validateDepartment(req.body);
    if (error) {
        return res.status(400).send({
            message: error.details[0].message
        });
    }

    const deptRequest = req.body;
    const sqlQuery = `
    INSERT INTO ${tables.tableNames.department}
    (deptName, building, budget)
    VALUES ('${deptRequest.deptName}', '${deptRequest.building}', ${deptRequest.budget})`

    db.run(sqlQuery, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occured while trying to save the department details"
            });
        }
        res.send({
            message: "Department saved successfully."
        });
    });
});

router.post("/:name/instructors", (req, res) => {
    const { error } = validateTeaches(req.body);
    if (error) {
        return res.status(400).send({
            message: error.details[0].message
        });
    }

    const teachesReq = req.body;
    const sqlQuery = `
    INSERT INTO ${tables.tableNames.teaches}
    (${tables.teachesColumns.instructor_id}, ${tables.teachesColumns.section_id})
    VALUES (${teachesReq.instructor_id}, ${teachesReq.section_id})`;

    db.run(sqlQuery, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occured while trying to save the instructor relation"
            });
        }
        res.send({
            message: "Instructor added to the department."
        });
    });
});

module.exports = router;