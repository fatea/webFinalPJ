var db = require('../models/db');

function Img(user) {
    this.username = user.username;
};


Img.get = function(username, callback){
    db.query("SELECT * FROM  IMG_LIST WHERE username = '"+ username + "'", function(err, res){
        if(err){
            console.log(err);
            return callback(err);
        }
        else{
            console.log(res);
            return callback(res);
        }
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