const express = require('express');
const router = express.Router();
const db = require('../db/database').getDatabase();
const tables = require('../db/tables');
const { validateStudent } = require('../db/models');

router.get("/", (req, res) => {
    const sqlQuery = `SELECT * FROM ${tables.tableNames.student}`;
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

router.get("/:id", (req, res) => {
    const id = req.params.id;
    const sqlQuery = `SELECT * FROM ${tables.tableNames.student} WHERE ${tables.studentColumns.id} = ?`;
    db.get(sqlQuery, [req.params.id], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occurred"
            });
        }
        if (!rows) {
            return res.status(404).send({
                message: "A student with the requested ID was not found."
            });
        }
        return res.send(rows);
    });
});

router.get("/:id/advisor", (req, res) => {
    const sqlQuery = `
    SELECT * FROM ${tables.tableNames.instructor}
    WHERE ${tables.instructorColumns.id} = 
        (SELECT ${tables.studentColumns.instructor_id} 
        FROM ${tables.tableNames.student}
        WHERE ${tables.studentColumns.id} = ?
        )`;

    db.get(sqlQuery, [req.params.id], (err, row) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occurred"
            });
        }
        if (!row) {
            return res.status(404).send({
                message: "Advisor for this student not found."
            });
        }
        res.send(row);
    });
});

router.post("/", (req, res) => {
    const { error } = validateStudent(req.body);
    if (error) {
        return res.status(400).send({
            message: error.details[0].message
        });
    }

    const studentReq = req.body;
    const sqlQuery = `
    INSERT INTO ${tables.tableNames.student}
    (name, total_credits, department_name)
    VALUES ('${studentReq.name}', ${studentReq.total_credits}, '${studentReq.department_name}')`;

    db.run(sqlQuery, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occured while trying to save the student details"
            });
        }
        res.send({
            message: "Student saved successfully."
        });
    });
});

module.exports = router;