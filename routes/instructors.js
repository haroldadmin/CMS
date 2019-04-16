const router = require('express').Router();
const tables = require('../db/tables');
const db = require('../db/database').getDatabase();

router.get("/", (req, res) => {
    const sqlQuery = `SELECT * FROM ${tables.tableNames.instructor}`
    db.all(sqlQuery, (err, rows) => {
        if (err) {
            return res.status(500).send({
                message: "An error occurred."
            })
        }
        res.send(rows);
    });
});

router.get("/:id", (req, res) => {
    const sqlQuery = `SELECT * FROM ${tables.tableNames.instructor} WHERE ${tables.instructorColumns.id} = ?`;
    db.get(sqlQuery, [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).send({
                message: "An error occurred."
            });
        }
        if (!rows) {
            return res.status(404).send({
                message: "An instructor with the requested ID was not found."
            });
        }
        res.send(rows);
    });
});

router.get("/:id/sections", (req, res) => {
    const sqlQuery = `
    SELECT * FROM ${tables.tableNames.section} 
    WHERE ${tables.sectionColumns.id} IN
        (SELECT ${tables.teachesColumns.section_id} 
        FROM ${tables.tableNames.teaches} 
        WHERE ${tables.teachesColumns.instructor_id} = $instructorId
        );
    `
    db.all(sqlQuery, [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).send({
                message: "An error occurred."
            });
        }
        if (!rows) {
            return res.status(404).send({
                message: "No instructors teaching this section could be found."
            });
        }
        return res.send(rows);
    });
});

router.get("/:id/department", (req, res) => {
    const sqlQuery = `
    SELECT * FROM ${tables.tableNames.department}
    WHERE ${tables.deptColumns.deptName} =
        (SELECT ${tables.instructorColumns.department_name} FROM ${tables.tableNames.instructor}
         WHERE ${tables.instructorColumns.id} = ?
         );`

    db.get(sqlQuery, [req.params.id], (err, row) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occurred."
            });
        }
        if (!row) {
            return res.status(404).send({
                message: "Department for this instructor not found."
            });
        }
        return res.send(row);
    })
})

module.exports = router;