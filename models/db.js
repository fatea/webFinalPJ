var mysql = require('mysql');
var settings = require('../settings');
var connection = mysql.createConnection({
    host : settings.host,
    user : settings.user,
    password : settings.password,
    database : settings.database,
    port : settings.port
});
connection.connect();
module.exports = connection;