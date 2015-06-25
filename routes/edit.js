var express = require('express');
var router = express.Router({ mergeParams: true});
var Post = require('../models/post');
var getContent = require('./lib/getContent');
var async = require('async');
var db = require('../models/db');
var markdown = require('markdown');
//auth session
var auth = require('./lib/auth');
router.get('/', auth.pleaseLogin);

router.get('/', function(req, res, next) {
    if((req.session.username == req.params.username)){
        var actionURL ='';
        if(req.params.action == 'new'){

            async.waterfall(
                [
                    function(callback){
                        Post.getAllCategory(req.session.username, callback);
                    },
                    function(categoryResult, callback){
                        actionURL = ('/'+req.params.username+'/edit/'+req.params.action);
                        res.render('edit',
                            {
                                username: req.session.username,
                                isNewPost: true,
                                actionURL : actionURL,
                                categoryArr : categoryResult,
                                presentCategory : false
                            });
                    }
                ]
            );

        }
        else {


            var guest = false;
            getContent.getBlog(req.params.username, req.params.date, req.params.title, guest,
                function(err, results){
                    var user = results.userData[0];
                    var postNotFound = (results.postData == false);
                    var post = results.postData.post;

                    if(postNotFound){
                        next();
                    }
                    else{

                        async.waterfall(
                            [
                                function(callback){
                                    Post.getAllCategory(user.username, callback);
                                },
                                function(categoryResult,callback){
                                     actionURL = ('/'+req.params.username+'/edit/'+req.params.date+'/'+req.params.title);
                                    res.render('edit', {
                                        actionURL : actionURL,
                                        hasPost : (typeof(post)!='undefined'&&post.length > 0),
                                        username: user.username,
                                        presentCategory : post.category,
                                        categoryArr : categoryResult,
                                        tags : post.tag,
                                        title : post.title,
                                        content: post.content

                                    });
                        }
                            ]
                        );
                    }

                }
            );


        }
    }
    else{
        next();
    }
});




router.post('/', function(req, res,next){
    if((req.session.username == req.params.username)){

        if(req.params.action == 'new'){

            var postData = {
                username : req.session.username,
                title : req.body.titleArea,
                content : req.body.editArea,
                tag : req.body.tagArea,
                category : req.body.categorySelect
            };
            var post = new Post(postData);
            post.save();
            res.redirect('/'+req.session.username+'/index');



        }else{
            var username = req.session.username;
            var date = req.params.date;
            var title = req.params.title;

            var updateData = {
                title : req.body.titleArea,
                content : req.body.editArea,
                tag : req.body.tagArea,
                category : req.body.categorySelect
            };
            async.waterfall(
                [
                    function(callback){
                        var selectSQL = 'SELECT * FROM POST_LIST WHERE username = ? AND date = ? AND title = ?';
                        db.query(
                            selectSQL, [username, date, title],
                            function(err, results){
                                if(err){
                                    console.log(err + ' Err happens in router:edit.js.newcategory.selectSQL');
                                }
                                else{
                                    if(results.length > 0){
                                        callback(null, results[0].postid);
                                    }
                                    else{
                                        callback(null, false);
                                    }
                                }
                            }
                        );
                    },
                    function(postid, callback){
                        var updatePostSQL = 'UPDATE POST_LIST SET ? WHERE postid = '+postid+'';
                        var updateCategorySQL = 'UPDATE CATEGORY_LIST SET ? WHERE postid = '+postid+'';
                        //写到这里了

                    }
                ]
            );

        }


    }
    else{
        next();
    }

});




router.post('/newcategory', function(req, res, next){
    if((req.session.username == req.params.username)){
        console.log(req.params);
        console.log(req.body);
        var username = req.params.username;
        var date = req.params.date;
        var title = req.params.title;
        var category = req.body.category;

        async.waterfall(
            [
                function(callback){
                    var selectSQL = 'SELECT * FROM POST_LIST WHERE username = ? AND date = ? AND title = ?';
                    db.query(
                        selectSQL, [username, date, title],
                        function(err, results){
                            if(err){
                                console.log(err + ' Err happens in router:edit.js.newcategory.selectSQL');
                            }
                            else{
                                if(results.length > 0){
                                    callback(null, results[0].postid);
                                }
                                else{
                                    callback(null, false);
                                }
                            }
                        }
                    );
                },
                function(postid, callback){

                    if(postid != false){
                    var insertSQL = 'INSERT INTO CATEGORY_LIST SET ?';
                    db.query(
                        insertSQL,{username:username,postid:postid, category:category},
                        function(err, results){
                            if(err){
                                console.log(err + ' Err happens in router:edit.js.newcategory.insertSQL');
                                res.json({status:false});
                                res.end();
                            }
                            else{
                                if(typeof(results.insertId) == 'undefined'){
                                    res.json({status:false});
                                    res.end();
                                }
                                else{
                                    res.json({status:true});
                                    res.end();
                                }
                            }
                        }
                    );
                    }else{
                        res.json({status:false});
                        res.end();
                    }

                }
          ]

        );

    }else{
        next();
    }

});

module.exports = router;
