var express = require('express');
var router = express.Router({ mergeParams: true});
//var clone = require('clone');
var async = require('async');
var getContent = require('./lib/getContent');
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



            var fullUrl =  req.protocol + '://' + req.get('host') + '/'+req.params.username+'/index';


            if(postNotFound){
                    next();
            }
            else{



                if(comments == false){
                    comments = [];
                }


                res.render('blog', {
                    //postData : postData,
                    hasPost : (typeof(post)!='undefined'&&post.length > 0),
                    username: user.username,
                    name : user.name,
                    mainTitle : user.name +'的博客',
                    subTitle : fullUrl.toString(),
                    comments : comments,
                    category : post.category,
                    favor : post.favor,
                    tags : tag,
                    loginStatus : (req.session.username != null),
                    guest : (req.params.username != req.session.username),
                    title : post.title,
                    content: post.content,
                    time : post.time,
                    pageview : post.pageview,
                    imgsrc : '/images/avatars/'+req.params.username+'.gif'
                });

            }
        });

});


router.post('/like', function(req, res, next){
        console.log(req.params);

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
                                if (typeof(results.insertId) == 'undefined') {
                                    callback(null, false);
                                } else {
                                    callback(null, -1);
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



router.post('/comment', function(req, res, next){
    res.write('true');
    res.end();
});






module.exports = router;
