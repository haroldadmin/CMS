const Express = require('express');

module.exports = (app) => {
    app.use(Express.json());
}