const Express = require('express');
const studentsRouter = require('../routes/students');
const departmentsRouter = require('../routes/departments');
const instructorsRouter = require('../routes/instructors');
const sectionsRouter = require('../routes/sections');

module.exports = (app) => {
    app.use(Express.json());
    app.use("/students", studentsRouter);
    app.use("/departments", departmentsRouter);
    app.use("/instructors", instructorsRouter);
    app.use("/sections", sectionsRouter);
}