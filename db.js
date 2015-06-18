var mysql = require('mysql');

var conn = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '128',
    database : 'weblab',
    port: 3306
});

module.exports = conn;

