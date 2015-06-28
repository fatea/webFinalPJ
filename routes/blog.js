var express = require('express');
var router = express.Router({ mergeParams: true});
//var clone = require('clone');
var async = require('async');
var getContent = require('./lib/getContent');
var markdown = require('markdown').markdown;
var dateFormat = require('../routes/lib/dateFormat');
//var utf = require('./lib/utf');
var db = require('../models/db');
router.get('/', function(req, res, next) {

    getContent.getBlog(req.params.username, req.params.date, req.params.title, (req.params.username != req.session.username),

        function(err, results){

            var user = results.userData[0];

            var postNotFound = (results.postData == false);
            var post = results.postData.post;
            var comments = results.postData.comments;
            var tag = results.postData.tag;
            var category = results.postData.category;
            var previousPost = results.postData.previousPost;
            var nextPost = results.postData.nextPost;

            var fullUrl =  req.protocol + '://' + req.get('host') + '/'+req.params.username+'/index';


            if(postNotFound){
                    next();
            }
            else{




                if(comments == false){
                    comments = [];
                }

                var hasLogin = (typeof(req.session.username) != 'undefined');
                var isAdmin = ((hasLogin == true) && (req.session.username == user.username));

                res.render('blog', {
                    //postData : postData,
                    hasPost : (typeof(post)!='undefined'&&post.length > 0),
                    username: user.username,
                    name : user.name,
                    mainTitle : user.name +'的博客',
                    subTitle : fullUrl.toString(),
                    comments : comments,
                    category : category,
                    favor : post.favor,
                    tags : tag,
                    guest : (req.params.username != req.session.username),
                    visitorUsername : req.session.username,
                    hasLogin : hasLogin,
                    isAdmin : isAdmin,
                    title : post.title,
                    content: markdown.toHTML(post.content),
                    date : post.date,
                    time : post.time,
                    pageview : post.pageview,
                    imgsrc : user.avatar,
                    previousPost : previousPost,
                    nextPost : nextPost
                });

            }
        });

});

router.post('/commenttag', function(req, res, next){
    if(typeof(req.session.username)!= 'undefined'){
        res.json({status : true});
        res.end();
    }
    else{
        res.json({status : false});
        res.end();
    }
});



router.post('/like', function(req, res, next){


    if(typeof(req.session.username) != 'undefined'){
        var supportername =req.session.username;
        var date = req.params.date;
        var title = req.params.title;
        //console.log(req.params);
        var sqlSet = [req.params.username, date, title];
        //console.log(sqlSet);
        async.waterfall([
            function(callback){
                var selectPostSQL = 'SELECT * FROM POST_LIST WHERE username = ? AND date = ? AND title = ?';
                db.query(selectPostSQL, sqlSet, function (err, results) {
                    if (err) {
                        console.log(err+'err happens in router: blog.js.selectPost');
                    }

                    if(results.length == 0){
                        callback(null, false);
                    }else{
                        //console.log('this is the original post: '+results[0]);
                        callback(null, results[0].postid);}
                });
            },
                function(postid, callback){
                  if(postid != false){
                      var selectFavorSQL = 'SELECT * FROM FAVOR_LIST WHERE postid = ? AND username = ?';
                      db.query(selectFavorSQL, [postid, supportername],function(err, results){
                         if(err){
                             console.log(err+'err happens in router: blog.js.selectPost');
                         }

                          if(results.length == 0){
                              callback(null, false, postid);
                          }else{
                              callback(null, true, postid);
                          }
                      });
                  }else{
                      callback(null, false, false);
                  }
                },

            function(hasFavored, postid, callback){
                    if(postid != false){
                        var updatePostSQL ='';
                        if(hasFavored){
                            updatePostSQL = 'UPDATE POST_LIST SET favor = favor-1 WHERE postid = ?';
                        }else{
                            updatePostSQL = 'UPDATE POST_LIST SET favor = favor+1 WHERE postid = ?';}
                            db.query(
                                updatePostSQL, [postid], function(err, results){
                                    if (err) {

                                        console.log(err + 'err happens in router:blog.js.updatePost');
                                    }

                                    if (results.affectedRows == 0) {
                                        callback(null, false, false);
                                    } else {
                                        callback(null, hasFavored, postid);
                                    }
                                }
                            );



                    }else {
                        callback(null, false, false);
                    }

            },
            function(hasFavored, postid, callback){
                var deleteFavorSQL = 'DELETE FROM FAVOR_LIST WHERE username = ? AND postid = ?';
                var insertFavorSQL = 'INSERT INTO FAVOR_LIST SET ?';
                if(postid != false){
                    if(hasFavored){
                        db.query(
                            deleteFavorSQL, [supportername, postid], function(err, results){
                                if (err) {
                                    console.log(err + 'err happens in router:blog.js.deleteFavor');
                                }

                                if(results.affectedRows > 0){
                                    console.log(results.affectedRows);
                                    callback(null, -1);
                                }else{
                                    callback(null, false);
                                }
                            }
                        );
                    } else{
                        db.query(
                            insertFavorSQL, {username:supportername, postid:postid},function(err, results){
                                if (err) {
                                    console.log(err + 'err happens in router:blog.js.insertFavor');
                                }

                                if (typeof(results.insertId) == 'undefined') {
                                    callback(null, false);
                                } else {
                                    callback(null, 1);
                                }
                            }
                        );
                    }

                }else {
                    callback(null, false);
                }
            }
        ],
        function(err, result){
            res.write(result+'');
            res.end();
        }
        );

    }else{
        res.write(false+'');
        res.end();
    }
});



router.post('/newcomment', function(req, res, next){
    if(typeof(req.session.username) != 'undefined'){
        var  commenterUsername = req.session.username;
        var commentContent = req.body.commentContent;
        console.log(req.body);


        var date = req.params.date;
        var title = req.params.title;
        var postSet = [req.params.username, date, title];


        async.waterfall(
            [
                function(callback){
                    async.parallel(
                        {
                            postid : function(subcb){
                                var selectPostSQL = 'SELECT postid FROM POST_LIST WHERE username = ? AND date = ? AND title = ?';
                                db.query(selectPostSQL, postSet, function (err, results) {
                                    if (err) {
                                        console.log(err+'err happens in router: blog.js.selectPost in newcomment');
                                    }

                                    if(results.length == 0){
                                        subcb(null, false);
                                    }else{
                                        //console.log('this is the original post: '+results[0]);
                                        subcb(null, results[0].postid);}
                                });
                            },
                            commenterName : function(subcb){
                                var selectNameSQL = 'SELECT name FROM USER_LIST WHERE username = ?';
                                db.query(selectNameSQL, [commenterUsername], function (err, results) {
                                    if (err) {
                                        console.log(err+'err happens in router: blog.js.selectPost in newcomment');
                                    }

                                    if(results.length == 0){
                                        subcb(null, false);
                                    }else{
                                        //console.log('this is the original post: '+results[0]);
                                        subcb(null, results[0].name);}
                                });
                            }
                        },function(err, results){
                            callback(null, results.postid, results.commenterName);
                        }
                    );


                },
                function(postid,commenterName, callback){
                        if(postid != false){
                            var insertCommentSQL = 'INSERT INTO COMMENT_LIST SET ?';
                            var time = dateFormat.getTime(new Date());
                            var commentSet = {postid : postid,
                                username : commenterUsername,
                                name:commenterName,
                                content : commentContent,
                                time:time};

                            console.log(commentSet);
                            db.query(insertCommentSQL, commentSet,
                                function(err,results){
                                    if (err) {
                                        console.log(err + 'err happens in router:blog.js.insertComment');
                                    }

                                    if (typeof(results.insertId) == 'undefined') {
                                        res.json({status:false});
                                        res.end();
                                    } else {
                                        res.json({status:true,
                                            insertId : results.insertId,
                                            commenterUsername:commenterUsername ,
                                            commenterName:commenterName,
                                            commentTime: time});
                                    }
                                });
                        }else{
                           res.json({status:false});
                            res.end();
                        }
                }
            ]
        );
    }else{
        res.json({status:false});
        res.end();
    }






});


router.post('/deletecomment', function(req, res, next){
    if(typeof(req.session.username) != 'undefined'){

        var  commenterUsername = req.session.username;
        var commentid = req.body.commentid;

        if(req.session.username != req.params.username){
                async.waterfall(
                    [
                        function(callback){
                            var selectCommentSQL = 'SELECT * FROM COMMENT_LIST WHERE commentid = ?';
                            db.query(
                                selectCommentSQL, [commentid],
                                function(err, results){
                                    if (err) {
                                        console.log(err+'err happens in router: blog.js.selectPost in deletecomment');
                                    }

                                    if(results.length == 0){
                                        callback(null, false);
                                    }else {
                                        //console.log('this is the original post: '+results[0]);
                                        if (results[0].username == commenterUsername) {
                                            callback(null, true);
                                        }
                                        else {
                                        callback(null, false);
                                        }
                                    }

                                }
                            );
                        },
                        function(isSameUser, callback){
                            if(isSameUser == true){
                                var deleteCommentSQL = 'DELETE FROM COMMENT_LIST WHERE username = ? AND commentid = ?';
                                db.query(
                                    deleteCommentSQL,[commenterUsername, commentid],
                                    function(err, results){
                                        console.log(results);
                                        if (err) {
                                            console.log(err + ' Err happens in router:blog.js.deletecomment isSameUser');
                                        }
                                        if (typeof(results.insertId) == 'undefined') {
                                            res.json({status:false, isSameUser:true, isAdmin:false});
                                            res.end();
                                        } else {
                                            res.json({status:true, isSameUser:true, isAdmin:false});
                                            res.end();
                                        }
                                    }
                                );

                            }else{
                                res.json({status:false, isSameUser:false, isAdmin:false});
                            }
                        }
                    ]


                );

        }else{

            var deleteCommentByAdminSQL = 'DELETE FROM COMMENT_LIST WHERE commentid = ?';
                db.query(
                    deleteCommentByAdminSQL, [commentid],
                    function(err, results){
                        if(err){
                            console.log(err + ' Err happens in router:blog.js.deletecomment isSameUser');
                        }
                        else{
                            if(typeof(results.insertId) == 'undefined'){
                                res.json({status:false, isAdmin:true});
                                res.end();
                            }
                            else{
                                res.json({status:true, isAdmin:true});
                                res.end();
                            }
                        }
                    }
                );
        }
    }
    else{
        res.json({status:false});
        res.end();
    }
});






module.exports = router;
