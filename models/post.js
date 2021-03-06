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

Post.prototype.save = function(cb){
    var date = new Date();

    var post = {
        username: this.username,
        title : this.title,
        content : this.content,
        date : dateFormat.getDate(date),
        time :dateFormat.getTime(date),
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
        function(postid, callback){
            async.parallel(
                {

                    category : function(subcb){

                        async.waterfall([
                            function(subsubcb){

                                category.postid = postid;
                                var insertSQL = 'insert into CATEGORY_LIST SET ?';
                                db.query(insertSQL, category, function(err, result){
                                    if (err){
                                        console.log(err);
                                        console.log('err happens in Post.save category');
                                    }
                                    else{

                                        if(typeof(result.insertId) != 'undefined'){
                                        subsubcb(null, true);}
                                        else{
                                            subsubcb(null, false);
                                        }
                                    }
                                });
                            },
                            function(insertStauts, subsubcb) {

                                if (insertStauts == true) {

                                var deleteSQL = 'DELETE FROM CATEGORY_LIST WHERE postid IS NULL AND username = ? AND category = ?';
                                db.query(deleteSQL, [category.username, category.category], function (err, result) {
                                    if (err) {
                                        console.log(err);
                                        console.log('err happens in Post.save category');
                                    }
                                    else {

                                        console.log('已经进入到category这步了');
                                        subcb(null, postid);
                                    }
                                });
                            }

                            }
                        ]);

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

                                callback(null, postid);
                            }
                        });
                    }
                });

                },
        function(postid, callback){
            var selectPostSQL = 'SELECT * FROM POST_LIST WHERE postid = ?';
            db.query(selectPostSQL, postid,
            function(err, results){
                if(err){
                    console.log(err);
                    console.log(' Err happens in Post.save selectInsertedPost');
                }else{
                    if(results.length > 0){
                        cb(results[0]);
                    }else{
                        cb(false);
                    }
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
        content : this.content

    };

    var category = this.category;

    var tag = Trim.normal(this.tag).split(' ');

    async.waterfall([
        function(callback){
            var updateSQL = 'UPDATE POST_LIST SET title = :title, content = :content';
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



    var selectSQL = 'SELECT POST_LIST.* , CATEGORY_LIST.category, COUNT(DISTINCT(COMMENT_LIST.commentid)) AS commentCount , GROUP_CONCAT(DISTINCT(TAG_LIST.tag)) AS tag ' +
        'FROM POST_LIST ' +
        'LEFT JOIN CATEGORY_LIST ' +
        'ON POST_LIST.postid = CATEGORY_LIST.postid ' +
        'LEFT JOIN COMMENT_LIST ' +
        'ON POST_LIST.postid = COMMENT_LIST.postid ' +
        'LEFT JOIN TAG_LIST ' +
        'ON POST_LIST.postid = TAG_LIST.postid ' +
        'WHERE POST_LIST.username = ? ' +
        'GROUP BY POST_LIST.postid ' +
        'ORDER BY POST_LIST.realtime DESC';




/*
   var whetherCanSQL = 'SELECT POST_LIST.* , CATEGORY_LIST.category , GROUP_CONCAT(TAG_LIST.tag) AS tag , COUNT(DISTINCT(COMMENT_LIST.commentid)) AS commentCount ' +
       'FROM POST_LIST ' +
       'LEFT JOIN CATEGORY_LIST ' +
       'ON  POST_LIST.postid = CATEGORY_LIST.postid ' +
       'LEFT JOIN TAG_LIST ' +
       'ON POST_LIST.postid = TAG_LIST.postid ' +
       'LEFT JOIN COMMENT_LIST ' +
       'ON POST_LIST.postid = COMMENT_LIST.postid ' +
       'WHERE POST_LIST.username = ? ' +
       'GROUP BY POST_LIST.postid ' +
       'ORDER BY POST_LIST.realtime DESC';*/

    db.query(selectSQL, [username], function(err, results){
       if(err){
           console.log(err+' Err happens in Post.getAllPost');
       } else{
           if(results.length == 0){
               console.log('没有博文记录');
               callback(null, false);
           }else{

               callback(null, results);
           }
       }
    });











/*
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
    */




};


Post.getOnePost = function(username, date , title, guest, callback){
var sqlSet = [username, date, title];
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
                                                //console.log('this is the original category: '+results[0].category);
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
                                    },

                                        previousPost : function(subsubcb){

                                            var selectPreviousPostSQL = 'SELECT  * FROM POST_LIST WHERE postid > ? AND username = ? ORDER BY postid DESC LIMIT 1';
                                            //var selectPreviousPostSQL = 'SELECT  * FROM POST_LIST WEHRE postid > 57 ORDER BY postid DESC ';
                                            db.query(selectPreviousPostSQL, [postid, username], function (err, results) {
                                                if (err) {
                                                    console.log(err+'err happens in Post.getOnePost.selectPreviousPost');
                                                }

                                                if(results.length == 0){
                                                    console.log('tag not found');
                                                    subsubcb(null, false);
                                                }else{

                                                    //console.log('this is the original tag: '+results);
                                                    var previousURL = ('/'+results[0].username+'/'+results[0].date+'/'+results[0].title);
                                                    console.log(previousURL);
                                                    subsubcb(null, {url:previousURL, title:results[0].title });}


                                            });
                                        },
                                        nextPost : function(subsubcb){
                                            var selectNextPostSQL = 'SELECT  * FROM POST_LIST WHERE postid < ? AND username = ? LIMIT 1';
                                            db.query(selectNextPostSQL, [postid,username], function (err, results) {
                                                if (err) {
                                                    console.log(err+'err happens in Post.getOnePost.selectPreviousPost');
                                                }

                                                if(results.length == 0){
                                                    console.log('tag not found');
                                                    subsubcb(null, false);
                                                }else{
                                                    //console.log('this is the original tag: '+results);
                                                    var nextURL = ('/'+results[0].username+'/'+results[0].date+'/'+results[0].title);
                                                    subsubcb(null, {url:nextURL, title:results[0].title });}


                                            });
                                        }


                                },
                                function(err, results){

                                    subcb(null, {post : postResult,
                                        comments: results.comments,
                                        category : results.category,
                                        tag : results.tag,
                                        previousPost : results.previousPost,
                                        nextPost : results.nextPost
                                    });
                                }
                                );

                            }
                            else
                            subcb(null, false);
                        }
                    ],
                    function(err, finalResult){

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

    async.parallel({
        hasPost: function(subcb){
            var selectHasPostSQL = 'SELECT category, COUNT(category) as total FROM CATEGORY_LIST WHERE username = ? AND postid IS NOT NULL GROUP BY category';
            db.query(selectHasPostSQL, [username],
            function(err, results){
                if (err) {
                    console.log(err+'err happens in Post.getAllCategory.HasPost');
                }

                if(results.length == 0){
                    subcb(null, false);
                }else{
                    subcb(null, results);}
            });
        },
        hasNoPost: function(subcb){
            var selectHasNoPostSQL = 'SELECT category, COUNT(category) as total FROM CATEGORY_LIST WHERE username = ? AND postid IS NULL GROUP BY category';
            db.query(selectHasNoPostSQL, [username],
            function(err, results){
                if (err) {
                    console.log(err+'err happens in Post.getAllCategory.hasNoPost');
                }

                if(results.length == 0){

                    subcb(null, false);
                }else{
                    subcb(null, results);}
            });
        }
    }, function(err, results){
        var finalResult = null;
        if(results.hasNoPost != false){

        for(var i = 0; i < results.hasNoPost.length; i++){
            results.hasNoPost[i].total = 0;
        }
        }
        if((results.hasPost != false) && (results.hasNoPost != false)){
            finalResult = results.hasPost.concat(results.hasNoPost);
        }else{
            finalResult = (results.hasPost != false)?(results.hasPost):(results.hasNoPost);
        }



        callback(null, finalResult);

    });


/*
    db.query(selectSQL, username, function (err, results) {
            if (err) {
                console.log(err+'err happens in Post.getAllCategory');
            }

            if(results.length == 0){
                callback(null, false);
            }else{
                    console.log(results);
                callback(null, results);}


        }
    );
    */

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