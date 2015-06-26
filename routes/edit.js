var express = require('express');
var router = express.Router({ mergeParams: true});
var Post = require('../models/post');
var getContent = require('./lib/getContent');
var async = require('async');
var db = require('../models/db');
var markdown = require('markdown');
var Trim = require('./lib/trim');
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
                    var category = results.postData.category;
                    var tag = results.postData.tag.toString().replace(/,/g,' ');
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
                                        presentCategory : category,
                                        categoryArr : categoryResult,
                                        tag : tag,
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
                tag : Trim.normal(req.body.tagArea).split(' '),
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
                                    console.log(err + ' Err happens in router:edit.js.editPost.selectPost');
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
                    function(postid, callback) {
                        if(postid != false){

                        var updatePostSQL = 'UPDATE POST_LIST SET ? WHERE postid = ' + postid + '';
                        var updateCategorySQL = 'UPDATE CATEGORY_LIST SET ? WHERE postid = ' + postid + '';
                        var deleteTagSQL = 'DELETE FROM TAG_LIST WHERE postid = ' + postid + '';
                        var insertTagSQL = 'INSERT INTO TAG_LIST (username, postid, tag) VALUES ?';
                        //写到这里了

                        async.parallel({
                                updatePost: function (subcb) {
                                    db.query(updatePostSQL, {
                                        title: updateData.title,
                                        content: updateData.content
                                    }, function (err, results) {
                                        if (err) {
                                            console.log(err + ' Err happens in router:edit.js.editPost.updatePost');
                                        }
                                        else {
                                            if (results.affectedRows > 0) {
                                                subcb(null, true);
                                            }
                                            else {
                                                subcb(null, false);
                                            }
                                        }
                                    });

                                },
                                updateCategory: function (subcb) {
                                    db.query(updateCategorySQL, {category: updateData.category}, function (err, results) {
                                        if (err) {
                                            console.log(err + ' Err happens in router:edit.js.editPost.updateCategory');
                                        }
                                        else {
                                            if (results.affectedRows > 0) {
                                                subcb(null, true);
                                            }
                                            else {
                                                subcb(null, false);
                                            }
                                        }
                                    });
                                },
                                deleteAndInsertTag: function (subcb) {
                                    async.waterfall([
                                        function (subsubcb) {
                                            db.query(deleteTagSQL, function (err, results) {
                                                if (err) {
                                                    console.log(err + ' Err happens in router:edit.js.editPost.deleteTag');
                                                }
                                                else {
                                                    subsubcb(null, true);
                                                    /*
                                                     if (results.affectedRows > 0) {
                                                     subsubcb(null, true);
                                                     }
                                                     else {
                                                     console.log('删除已有tag有问题');
                                                     subsubcb(null, false);
                                                     }
                                                     */
                                                }
                                            });
                                        },
                                        function (deleteSuccess, subsubcb) {
                                            if (deleteSuccess) {
                                                var tagArr = [];
                                                for (var i = 0; i < updateData.tag.length; i++) {
                                                    tagArr[i] = [username, postid, updateData.tag[i]];
                                                }

                                                db.query(insertTagSQL, [tagArr],
                                                    function (err, results) {
                                                        if (err) {
                                                            console.log(err + ' Err happens in router:edit.js.editPost.insertTag');
                                                        }
                                                        else {
                                                            if (results.affectedRows > 0) {
                                                                subsubcb(null, true);
                                                            }
                                                            else {
                                                                console.log('重新新增Tag出现问题');
                                                                subsubcb(null, false);
                                                            }
                                                        }
                                                    });

                                            } else {
                                                subsubcb(null, false);
                                            }
                                        }
                                    ], function (err, results) {
                                        subcb(null, results);
                                    });
                                }
                            },
                            function (err, results) {
                                if ((results.updatePost == true) && (results.updateCategory == true) && (results.deleteAndInsertTag == true)) {
                                 res.redirect('/' + username + '/' + date + '/' + title+'');
                                    console.log(title);
                                    console.log(updateData.title);
                                } else {
                                    console.log('这是最终的结果 ' + results);
                                    console.log('博文修改失败');
                                }
                            });


                    }else{
                            console.log('博文修改失败');
                        }
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
