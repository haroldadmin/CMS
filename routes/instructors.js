const router = require('express').Router();
const tables = require('../db/tables');
const db = require('../db/database').getDatabase();
const { validateInstructor } = require('../db/models');

/**
 * @swagger
 * definitions:
 *  Instructor:
 *      type: object
 *      properties:
 *          name:
 *              type: string
 *              example: "Jane Doe"
 *          department_name:
 *              type: string
 *              example: "Computer Science"
 *          salary:
 *              type: integer
 *              example: 1000
 *          id:
 *              type: integer
 *              example: 1
 *  Create Instructor Request:
 *      type: object
 *      properties:
 *          name:
 *              type: string
 *              example: "Jane Doe"
 *          department_name:
 *              type: string
 *              example: "Computer Science"
 *          salary:
 *              type: integer
 *              example: 1000
 */

/**
* @swagger
* /instructors:
*  get:
*      tags:
*          - instructors
*      description: Get all the instructors in the database
*      consumes:
*          - application/json
*      produces:
*          - application/json
*      responses:
*          200:
*              description: An Array of all the instructors
*              schema:
*                  $ref: "#/definitions/Instructor"
*          500:
*              description: Server error
*              schema:
*                  $ref: "#/definitions/Error"
*/
router.get("/", (req, res) => {
    const sqlQuery = `SELECT * FROM ${tables.tableNames.instructor}`
    db.all(sqlQuery, (err, rows) => {
        if (err) {
            return res.status(500).send({
                message: "An error occurred."
            })
        }
        res.render("../FrontEnd/instructors.ejs", {instructor:rows});
    });
});

/**
 * @swagger
 * /instructors/{id}:
 *  get:
 *      tags:
 *          - instructors
 *      description: Get a single instructor by their ID
 *      consumes:
 *          - application/json
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: id
 *            description: Instructor's ID
 *            in: path
 *            required: true
 *            type: integer
 *      responses:
 *          200:
 *              description: The requested Instructor object
 *              schema:
 *                  $ref: "#/definitions/Instructor"
 *          404:
 *              description: Instructor not found
 *              schema:
 *                  $ref: "#/definitions/Not Found"
 *          500:
 *              description: Server error
 *              schema:
 *                  $ref: "#/definitions/Error"
 */
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
        res.render("../FrontEnd/instructorByID.ejs", {instructor:rows});
    });
});

/**
 * @swagger
 * /instructors/{id}/sections:
 *  get:
 *      tags:
 *          - instructors
 *      description: Get all the sections taught by this instructor
 *      consumes:
 *          - application/json
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: id
 *            description: Instructor's ID
 *            in: path
 *            required: true
 *            type: integer
 *      responses:
 *          200:
 *              description: An array of sections
 *              schema:
 *                  $ref: "#/definitions/Section"
 *          404:
 *              description: No sections taught by this instructor could be found.
 *              schema:
 *                  $ref: "#/definitions/Not Found"
 *          500:
 *              description: Server error
 *              schema:
 *                  $ref: "#/definitions/Error"
 */
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
                message: "No sections taught by this instructor could be found."
            });
        }
        return res.send(rows);
    });
});

/**
 * @swagger
 * /instructors/{id}/department:
 *  get:
 *      tags:
 *          - instructors
 *      description: Get the department to which this instructor belongs
 *      consumes:
 *          - application/json
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: id
 *            description: Instructor's ID
 *            in: path
 *            required: true
 *            type: integer
 *      responses:
 *          200:
 *              description: The department object
 *              schema:
 *                  $ref: "#/definitions/Department"
 *          404:
 *              description: Department for this instructor not found
 *              schema:
 *                  $ref: "#/definitions/Not Found"
 *          500:
 *              description: Server error
 *              schema:
 *                  $ref: "#/definitions/Error"
 */
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

/**
 * @swagger
 * /instructors:
 *  post:
 *      tags:
 *          - instructors
 *      description: Create a new instructor in the database
 *      consumes:
 *          - application/json
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: instructor
 *            description: The instructor to be added
 *            in: body
 *            required: true
 *            type: object
 *            schema:
 *              $ref: "#/definitions/Create Instructor Request"
 *      responses:
 *          200:
 *              description: Instructor saved successfully
 *              schema:
 *                  $ref: "#/definitions/Success"
 *          400:
 *              description: Invalid schema of the instructor object
 *              schema:
 *                  $ref: "#/defintions/Invalid Schema"
 */
router.post("/", (req, res) => {
    const { error } = validateInstructor(req.body);
    if (error) {
        return res.status(400).send({
            message: error.details[0].message
        });
    }

    const instructorReq = req.body;
    const sqlQuery = `
    INSERT INTO ${tables.tableNames.instructor}
    (name, salary, department_name)
    VALUES ('${instructorReq.name}', ${instructorReq.salary}, '${instructorReq.department_name}')`;

    db.run(sqlQuery, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occured while trying to save the instructor details"
            });
        }
        res.send({
            message: "Instructor saved successfully."
        });
    });
});

module.exports = router;
