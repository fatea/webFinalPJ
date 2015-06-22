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


    if(typeof(req.session.username) != 'undefined'){
        var username =req.session.username;
        var date = req.params.date;
        var title = req.params.title;
        //console.log(req.params);
        var sqlSet = [username, date, title];
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

                        var updatePostSQL = 'UPDATE POST_LIST SET favor = favor+1 WHERE postid = ?';
                        db.query(
                            updatePostSQL, [postid], function(err, results){
                                if (err) {

                                    console.log(err + 'err happens in router:blog.js.updatePost');
                                }

                                if (results.affectedRows == 0) {
                                    callback(null, false);
                                } else {
                                    callback(null, postid);
                                }
                            }
                        );
                    }else {
                        callback(null, false);
                    }

            },
            function(postid, callback){
                if(postid != false){
                    //var updatePostSQL = 'UPDATE LIKE_LIST SET like = like+1,username = wjt WHERE postid = '+postid+'';
                    var insertFavorSQL = 'INSERT INTO FAVOR_LIST SET ?';
                    db.query(
                        insertFavorSQL, {username:username, postid:postid},function(err, results){
                            if (err) {
                                console.log(err + 'err happens in router:blog.js.updateFavor');
                            }

                            if (typeof(results.insertId) == 'undefined') {
                                callback(null, false);
                            } else {
                                callback(null, true);
                            }
                        }
                    );
                }else {
                    callback(null, false);
                }
            }
        ],
        function(err, result){
            res.send(result);
        }
        );

    }else{
        res.send(false);
    }
});

module.exports = router;
