const Express = require('express');
const studentsRouter = require('../routes/students');
const departmentsRouter = require('../routes/departments');

module.exports = (app) => {
    app.use(Express.json());
    app.use("/students", studentsRouter);
    app.use("/departments", departmentsRouter);
}