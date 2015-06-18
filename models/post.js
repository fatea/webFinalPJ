var db = require('../models/db');
var dateFormat = require('../routes/lib/dateFormat');
var async = require('async');
function Post(postData){
    this.username = postData.username;
    this.title = postData.title;
    this.content = postData.content;
    this.tag = postData.tag;
    this.category = postData.category;
}

Post.prototype.save = function(){
    var date = new Date();
    var post = {
        username: this.username,
        title : this.title,
        content : this.content,
        tag : this.tag,
        category : this.category,
        date : dateFormat.getDate(date),
        time :dateFormat.getTime(date),
        realdate : date,
        realtime : date
    };
    var insertSQL = 'insert into POST_LIST SET ?';

    db.query(insertSQL, post, function(err, res){
        if (err){
            console.log(err);
        }
        else{
            console.log("INSERT Return ==> ");
            console.log(res);
        }
    });
};

Post.getAllPost = function(username, callback) {

            var selectSQL = 'SELECT * FROM POST_LIST WHERE username = ?';
            db.query(selectSQL, username, function (err, results) {
                    if (err) {
                        console.log(err+'err happens in Post.getAll');
                    }

                    if(results.length == 0){

                        callback(null, false);
                    }else{
                        callback(null, results);}


                }
            );

};


Post.getOnePost = function(username, date , title, guest, callback){
var sqlSet = [username, date, title];
            console.log(title);
    async.series(
        {
            update : function(cb){

                if(guest) {
                    var updateSQL = 'UPDATE POST_LIST SET pageview = pageview+1 WHERE username = ? AND date = ? AND TITLE = ?';
                    db.query(updateSQL, sqlSet, function (err, results) {
                        if (err) {
                            console.log(err + 'err happens in Post.getOnePost.update');
                        }

                        if (results.length == 0) {
                            cb(null, false);
                        } else {
                            cb(null, results);
                        }


                    });
                }
                else{
                    cb(null, false);
                }



            },

            select : function(cb){
                async.waterfall(
                    [
                        function(subcb){
                            var selectPostSQL = 'SELECT * FROM POST_LIST WHERE username = ? AND date = ? AND TITLE = ?';
                            db.query(selectPostSQL, sqlSet, function (err, results) {
                                if (err) {
                                    console.log(err+'err happens in Post.getOnePost.select');
                                }

                                if(results.length == 0){
                                    subcb(null, false);
                                }else{

                                    subcb(null, results[0]);}


                            });
                        },

                        function(postResult, subcb){
                            if(postResult != false){

                            var postid =postResult.postid;

                            var selectCommentSQL = 'SELECT * FROM COMMENT_LIST WHERE postid = ?';
                            db.query(selectCommentSQL, postid, function (err, results) {
                                if (err) {
                                    console.log(err+'err happens in Post.getOnePost.selectComment');
                                }

                                if(results.length == 0){
                                    console.log('comment not found');
                                    subcb(null, postResult, false);
                                }else{

                                    subcb(null, postResult, results);}


                            });

                            }
                            else
                            subcb(null, false);


                        }

                    ],

                    function(err, postResult, commentResult){
                        var selectResult ={post: postResult, comments : commentResult};
                        cb(null, selectResult);
                    }


                );

            }

        },
        function(err, results){
            callback(null, results.select);
        }
    );

    /*

    db.query(selectSQL, selectSet, function (err, results) {
            if (err) {
                console.log(err+'err happens in Post.getOne');
            }

            if(results.length == 0){
                console.log('post not found');
                callback(null, false);
            }else{
                callback(null, results);}


        }
    );

    */
};


Post.getAllCategory = function(username, callback){
    var selectSQL = 'SELECT category, COUNT(category) as total FROM POST_LIST WHERE username = ? GROUP BY category';

    db.query(selectSQL, username, function (err, results) {
            if (err) {
                console.log(err+'err happens in Post.getAllCategory');
            }

            if(results.length == 0){
                callback(null, false);
            }else{
                callback(null, results);}


        }
    );
};

Post.getAllTag = function(username, callback){
    var selectSQL = 'SELECT DISTINCT tag FROM POST_LIST WHERE username = ?';
    db.query(selectSQL, username, function (err, results) {
            if (err) {
                console.log(err+'err happens in Post.getAllTag');
            }

            if(results.length == 0){
                callback(null, false);
            }else{
                callback(null, results);}


        }
    );
};






module.exports = Post;