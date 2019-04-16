const Express = require('express');
const studentsRouter = require('../routes/students');

module.exports = (app) => {
    app.use(Express.json());
    app.use("/students", studentsRouter);
}