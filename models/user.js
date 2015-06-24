var db = require('../models/db');

function User(user) {
    this.username = user.username;
    this.password = user.password;
    this.name = user.name;
};

User.prototype.register = function(callback) {
    var user = {
        username : this.username,
        password : this.password,
        name : this.name
    };
var insertSQL = "insert into USER_LIST values('"+user.username + "', '"+user.password+ "', '"+user.name+ "')";


    
    db.query(insertSQL, function(err, res){
        if (err){
            console.log(err);
            callback();
        }
        else{
            console.log("INSERT Return ==> ");
            console.log(res);
        }
    });
};

User.get = function(username, callback){
    db.query("SELECT * FROM  USER_LIST WHERE username = '"+ username + "'", function(err, results){
       if(err){
           console.log(err+'err happens in User.get');
       }

        if(results.length == 0){
            console.log('User not found');
            callback(null, false);
        } else{
        callback(null, results);}

    });
};

User.login = function(username, password, callback1, callback2) {
    var selectSQL = "SELECT * FROM  USER_LIST WHERE username = '"+ username + "' and password = '"+ password + "'";
 db.query(selectSQL, function(err, rows){
     if(err){
         console.log(err);

     }
     else{

     if(rows.length == 0){
         callback1();
         }
        else{
         callback2();
     }

     }
 })
};

module.exports = User;