const router = require('express').Router();
const tables = require('../db/tables');
const db = require('../db/database').getDatabase();
const { validateSection } = require('../db/models');

/** 
 * @swagger
 * definitions:
 *  Section:
 *      type: object
 *      properties:
 *          id:
 *              type: integer
 *              example: 1
 *          semester:
 *              type: integer
 *              description: The semester of this section. Should be between 1 and 8.
 *              example: 4
 *          year:
 *              type: integer
 *              description: The year of this section. Should be between 1 and 4.
 * 
 *  Error:
 *      type: object
 *      properties:
 *          message:
 *              type: string
 *              example: "An error occurred"
 *  Not Found:
 *      type: object
 *      properties:
 *          message:
 *              type: string
 *              example: "The requested resource could not be found"
 *  Invalid Schema:
 *      type: object
 *      properties:
 *          message:
 *              type: string
 *              example: "Resource is required"
 */

/**
* @swagger
* /sections:
*  get:
*      tags:
*          - sections
*      description: Get all the sections in the database
*      consumes:
*          - application/json
*      produces:
*          - application/json
*      responses:
*          200:
*              description: An Array of all the sections
*              schema:
*                  $ref: "#/definitions/Section"
*          500:
*              description: Server error
*              schema:
*                  $ref: "#/definitions/Error"
*/
router.get("/", (req, res) => {
    const sqlQuery = `SELECT * FROM ${tables.tableNames.section}`;
    db.all(sqlQuery, (err, rows) => {
        if (err) {
            return res.status(500).send({
                message: "An error occurred."
            })
        }
        res.send(rows);
    });
});

/**
 * @swagger
 * /sections/{id}:
 *  get:
 *      tags:
 *          - sections
 *      description: Get a single section by its ID
 *      consumes:
 *          - application/json
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: id
 *            description: Section's ID
 *            in: path
 *            required: true
 *            type: integer
 *      responses:
 *          200:
 *              description: The requested Section object
 *              schema:
 *                  $ref: "#/definitions/Section"
 *          404:
 *              description: Section not found
 *              schema:
 *                  $ref: "#/definitions/Not Found"
 *          500:
 *              description: Server error
 *              schema:
 *                  $ref: "#/definitions/Error"
 */
router.get("/:id", (req, res) => {
    const sqlQuery = `SELECT * FROM ${tables.tableNames.section} WHERE ${tables.sectionColumns.id} = ?`;
    db.get(sqlQuery, [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).send({
                message: "An error occurred."
            });
        }
        if (!rows) {
            return res.status(404).send({
                message: "A section with the requested ID could not be found."
            });
        }
        res.send(rows);
    });
});

/**
 * @swagger
 * /sections/{id}/instructors:
 *  get:
 *      tags:
 *          - sections
 *      description: Get all the instructors associated with this section
 *      consumes:
 *          - application/json
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: id
 *            description: Section's ID
 *            in: path
 *            required: true
 *            type: integer
 *      responses:
 *          200:
 *              description: An array of instructors
 *              schema:
 *                  $ref: "#/definitions/Section"
 *          404:
 *              description: Section not found
 *              schema:
 *                  $ref: "#/definitions/Not Found"
 *          500:
 *              description: Server error
 *              schema:
 *                  $ref: "#/definitions/Error"
 */
router.get("/:id/instructors", (req, res) => {

    const sqlQuery = `
    SELECT * FROM ${tables.tableNames.instructor} 
    WHERE ${tables.instructorColumns.id} IN
        (SELECT ${tables.teachesColumns.instructor_id} 
        FROM ${tables.tableNames.teaches} 
        WHERE ${tables.teachesColumns.section_id} = $sectionId
        );
    `
    db.all(sqlQuery, { $sectionId: req.params.id }, (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ message: "An error occurred." });
        }

        if (!rows) {
            return res.status(404).send({
                message: "Instructors of the section with the given ID could not be found."
            });
        }

        res.send(rows);
    })
});

/**
 * @swagger
 * /sections:
 *  post:
 *      tags:
 *          - sections
 *      description: Create a new section in the database
 *      consumes:
 *          - application/json
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: section
 *            description: The section to be added
 *            in: body
 *            required: true
 *            type: object
 *            schema:
 *              $ref: "#/definitions/Section"
 *      responses:
 *          200:
 *              description: Section saved successfully
 *              schema:
 *                  $ref: "#/definitions/Student"
 *          400:
 *              description: Invalid schema of the section object
 *              schema:
 *                  $ref: "#/defintions/Invalid Schema"
 */
router.post("/", (req, res) => {
    const { error } = validateSection(req.body);
    if (error) {
        return res.status(400).send({
            message: error.details[0].message
        });
    }

    const sectionReq = req.body;
    const sqlQuery = `
    INSERT INTO ${tables.tableNames.section}
    (id, semester, year)
    VALUES (${sectionReq.id}, ${sectionReq.semester}, ${sectionReq.year})`;

    db.run(sqlQuery, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occured while trying to save the section details"
            });
        }
        res.send({
            message: "Section saved successfully."
        });
    });
});

module.exports = router;