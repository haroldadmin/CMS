const express = require('express');
const router = express.Router();
const db = require('../db/database').getDatabase();
const tables = require('../db/tables');

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

module.exports = router;