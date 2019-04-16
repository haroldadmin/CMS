const router = require('express').Router();
const tables = require('../db/tables');
const db = require('../db/database').getDatabase();

router.get("/", (req, res) => {
    const sqlQuery = `SELECT * FROM ${tables.tableNames.instructor}`
    db.all(sqlQuery, (err, rows) => {
        if (err) {
            return res.status(500).send({
                message: "An error occurred"
            })
        }
        res.send(rows);
    });
});

module.exports = router;