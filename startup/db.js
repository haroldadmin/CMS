const sqlite3 = require('sqlite3');

module.exports = function () {
    const db = new sqlite3.Database(':memory:', (err) => {
        if (err) { return console.log("Error connecting to SQLite Database.") };
        console.log("Connected to the SQLite database");
    });
    return db;
}