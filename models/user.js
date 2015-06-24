var db = require('../models/db');
var async = require('async');
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

    var category = {
        username:this.username,
        category : '未分类博文'
    };




    async.waterfall(
        [
            function(subcb){
                var insertUserListSQL = 'insert into USER_LIST SET ?';
                db.query(insertUserListSQL, user, function(err, results){
                    if (err){
                        console.log(err);
                        subcb(null, false);
                    }
                    else{
                       if(typeof(results.insertId) != 'undefined'){
                           subcb(null, user.username);
                       }

                    }
                });
            },
            function(username, subcb){

                if(username != false){
                var insertCategoryListSQL = 'INSERT INTO CATEGORY_LIST SET ?';
                db.query(insertCategoryListSQL, category,
                function(err, results){
                    if (err){
                        console.log(err);
                        callback(false);
                    }
                    else{
                        if(typeof(results.insertId) != 'undefined'){
                            callback(true);
                        }

                    }
                });
                }
                else{
                    console.log('已存在相同用户名');
                    callback(false);
                }
            }
        ]
    );

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