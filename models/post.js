var db = require('../models/db');
var dateFormat = require('../routes/lib/dateFormat');
var async = require('async');
var Trim = require('../routes/lib/trim');

function Post(postData){
    this.username = postData.username;
    this.title = postData.title;
    this.content = postData.content;
    //this.tag = Trim.normal(postData.tag).split(' ');
    this.tag = postData.tag;
    this.category = postData.category;
}

Post.prototype.save = function(){
    var date = new Date();

    var post = {
        username: this.username,
        title : this.title,
        content : this.content,
        date : dateFormat.getDate(date),
        time :dateFormat.getTime(date),
        category : this.category,
        tag : Trim.normal(this.tag),
        realdate : date,
        realtime : date
    };

    var category = {
        username : this.username,
        category : this.category
    };

    var tag = {
        username : this.username,
        tag : Trim.normal(this.tag).split(' ')
    };

    async.waterfall([
        function(callback){
            var insertSQL = 'insert into POST_LIST SET ?';
            db.query(insertSQL, post, function(err, result){
                if (err){
                    console.log(post);
                    console.log(err);

                    console.log('err happens in Post.save post');
                }
                else{


                    callback(null, result.insertId);

                }
            });
        },
        function(postid){
            async.parallel(
                {

                    category : function(subcb){
                        category.postid = postid;
                        var insertSQL = 'insert into CATEGORY_LIST SET ?';
                        db.query(insertSQL, category, function(err, result){
                            if (err){
                                console.log(err);
                                console.log('err happens in Post.save category');
                            }
                            else{


                                subcb(null, result);
                            }
                        });
                    },

                    tag : function(subcb){

                        var tagArr = [];
                        for(var i = 0; i < tag.tag.length; i++){
                        tagArr[i] = [tag.username, postid, tag.tag[i]];
                        }

                        var insertSQL = 'insert into TAG_LIST (username, postid, tag) VALUES ?';
                        db.query(insertSQL, [tagArr], function(err, result){
                            if (err){
                                console.log(err);
                                console.log('err happens in Post.save tag');
                            }
                            else{

                                subcb(null, result);
                            }
                        });
                    }
                });

                }
    ]);

};

Post.prototype.update = function(){
    var date = new Date();
    var postid = this.postid;
    var post = {

        title : this.title,
        content : this.content,
        category : this.category,
        tag : Trim.normal(this.tag)

    };

    var category = this.category;

    var tag = Trim.normal(this.tag).split(' ');

    async.waterfall([
        function(callback){
            var updateSQL = 'UPDATE POST_LIST SET title = :title, content = :content, category = :category, tag = :tag';
            db.query(updateSQL, post, function(err, result){
                if (err){
                    console.log(post);
                    console.log(err);

                    console.log('err happens in Post.update post');
                }
                else{


                    callback(null, result.insertId);

                }
            });
        },
        function(postid){
            async.parallel(
                {

                    category : function(subcb){
                        category.postid = postid;
                        var insertSQL = 'insert into CATEGORY_LIST SET ?';
                        db.query(insertSQL, category, function(err, result){
                            if (err){
                                console.log(err);
                                console.log('err happens in Post.save category');
                            }
                            else{


                                subcb(null, result);
                            }
                        });
                    },

                    tag : function(subcb){

                        var tagArr = [];
                        for(var i = 0; i < tag.tag.length; i++){
                            tagArr[i] = [tag.username, postid, tag.tag[i]];
                        }

                        var insertSQL = 'insert into TAG_LIST (username, postid, tag) VALUES ?';
                        db.query(insertSQL, [tagArr], function(err, result){
                            if (err){
                                console.log(err);
                                console.log('err happens in Post.save tag');
                            }
                            else{

                                subcb(null, result);
                            }
                        });
                    }
                });

        }
    ]);

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
                                    //console.log('this is the original post: '+results[0]);
                                    subcb(null, results[0]);}


                            });
                        },

                        function(postResult, subcb){
                            if(postResult != false){

                            var postid =postResult.postid;

                                async.parallel({
                                comments : function(subsubcb){
                                    var selectCommentSQL = 'SELECT * FROM COMMENT_LIST WHERE postid = ?';
                                    db.query(selectCommentSQL, postid, function (err, results) {
                                        if (err) {
                                            console.log(err+'err happens in Post.getOnePost.selectComment');
                                        }

                                        if(results.length == 0){
                                            console.log('comment not found');
                                            subsubcb(null, false);
                                        }else{

                                            subsubcb(null, results);}


                                    });
                                },

                                    category : function(subsubcb){
                                        var selectCommentSQL = 'SELECT * FROM CATEGORY_LIST WHERE postid = ?';
                                        db.query(selectCommentSQL, postid, function (err, results) {
                                            if (err) {
                                                console.log(err+'err happens in Post.getOnePost.selectCategory');
                                            }

                                            if(results.length == 0){
                                                console.log('category not found');
                                                subsubcb(null, false);
                                            }else{
                                                //console.log('this is the original category: '+results);
                                                subsubcb(null, results[0].category);}


                                        });
                                    },

                                    tag : function(subsubcb){
                                        var selectCommentSQL = 'SELECT * FROM TAG_LIST WHERE postid = ?';
                                        db.query(selectCommentSQL, postid, function (err, results) {
                                            if (err) {
                                                console.log(err+'err happens in Post.getOnePost.selectTag');
                                            }

                                            if(results.length == 0){
                                                console.log('tag not found');
                                                subsubcb(null, false);
                                            }else{
                                                //console.log('this is the original tag: '+results);
                                                var tagResult = [];
                                                for(var i = 0; i <results.length; i++){
                                                    tagResult[i] = results[i].tag;
                                                }
                                                subsubcb(null, tagResult);}


                                        });
                                    }

                                },
                                function(err, results){

                                    subcb(null, {post : postResult, comments: results.comments, category : results.category, tag : results.tag});
                                }
                                );

                            }
                            else
                            subcb(null, false);
                        }
                    ],
                    function(err, finalResult){
                        //console.log(finalResult);
                        cb(null, finalResult);
                    }
                );
            }

        },
        function(err, results){
            callback(null, results.select);
        }
    );
};


Post.getAllCategory = function(username, callback){
    var selectSQL = 'SELECT category, COUNT(category) as total FROM CATEGORY_LIST WHERE username = ? GROUP BY category';

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
    var selectSQL = 'SELECT DISTINCT tag FROM TAG_LIST WHERE username = ?';
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