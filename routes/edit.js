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

                    if(postNotFound){
                        next();
                    }
                    else{
                        var post = results.postData.post;
                        var category = results.postData.category;
                        if(results.postData.tag != false){
                        var tag = results.postData.tag.toString().replace(/,/g,' ');
                        }else{
                            tag = "";
                        }

                        async.waterfall(
                            [
                                function(callback){
                                    Post.getAllCategory(user.username, callback);
                                },
                                function(categoryResult,callback){
                                    console.log('the categoryResult : '+ categoryResult);
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
            console.log(postData);
            var post = new Post(postData);
            post.save(function(returnedPost){
                var returnedPostURL = '/'+returnedPost.username +'/' +returnedPost.date + '/'+returnedPost.title;
                res.json({status : true, returnedPostURL : returnedPostURL });
                res.end();
            });




        }
        else if(req.params.action == 'checktitle'){
            var searchSameTitleUsername = req.body.username;
            var searchSameTitleDate = req.body.date;
            var searchSameTitleTitle = req.body.title;
            var searchSameTitleSQL = 'SELECT * FROM POST_LIST WHERE username = ? AND date = ? AND title = ?';
            db.query(searchSameTitleSQL, [searchSameTitleUsername, searchSameTitleDate, searchSameTitleTitle],
            function(err, results){
                if(err){
                    console.log(err);
                    console.log(' Err happens in routes/edit.js  post : checktitle');
                }
                else{
                    if(results.length > 0){
                        res.json({status:false});
                        res.end();
                    }else{
                        res.json({status:true});
                        res.end();
                    }
                }
            });
        }
        else if(req.params.action == 'newcategory') {

            var category_username = req.params.username;
            var category = req.body.category;

                var insertSQL = 'INSERT INTO CATEGORY_LIST SET ?';
                db.query(
                    insertSQL, {username: category_username, category: category},
                    function (err, results) {
                        if (err) {
                            console.log(err + ' Err happens in router:edit.js.newcategory.insertSQL');
                            res.json({status: false});
                            res.end();
                        }
                        else {
                            if (typeof(results.insertId) == 'undefined') {
                                res.json({status: false});
                                res.end();
                            }
                            else {
                                res.json({status: true});
                                res.end();
                            }
                        }
                    }
                );

        }


        else{
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
                                        console.log('Problem: selectPost');
                                        callback(null, false);
                                    }
                                }
                            }
                        );
                    },
                    function(postid, callback){
                        if(postid != false){
                            var selectCategorySQL = 'SELECT * FROM CATEGORY_LIST WHERE postid = ?';
                            db.query(selectCategorySQL, [postid],
                            function(err, results){
                                if(err){
                                    console.log(err + ' Err happens in router:edit.js.editPost.selectCategory');
                                }
                                else{
                                    if(results.length > 0){
                                        callback(null, results[0]);
                                    }
                                    else{
                                        console.log('Problem: selectCategory');
                                        callback(null, false);
                                    }
                                }
                            });
                        }
                    },
                    function(selectedCategory, callback) {
                        if(selectedCategory.postid != false){

                        var postid = selectedCategory.postid;

                        var updatePostSQL = 'UPDATE POST_LIST SET ? WHERE postid = ' + postid + '';
                        var updateCategorySQL = 'UPDATE CATEGORY_LIST SET ? WHERE postid = ' + postid + '';
                        var deleteTagSQL = 'DELETE FROM TAG_LIST WHERE postid = ' + postid + '';
                        var insertTagSQL = 'INSERT INTO TAG_LIST (username, postid, tag) VALUES ?';

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
                                                //console.log('Problem: updatePost');
                                                subcb(null, false);
                                            }
                                        }
                                    });

                                },
                                updateCategory: function (subcb) {
                                    async.waterfall([
                                        function(subsubcb){
                                            db.query(updateCategorySQL, {category: updateData.category}, function (err, results) {
                                                if (err) {
                                                    console.log(err + ' Err happens in router:edit.js.editPost.updateCategory');
                                                }

                                                        //console.log('Problem: updateCategory');
                                                        subsubcb(null, true);


                                            });
                                        },

                                        function(updateStatus, subsubcb){
                                            if (updateStatus == true) {

                                                var deleteSQL = 'DELETE FROM CATEGORY_LIST WHERE postid IS NULL AND username = ? AND category = ?';
                                                db.query(deleteSQL, [username, updateData.category], function (err, results) {
                                                    if (err) {
                                                        console.log(err);
                                                        console.log('err happens in Post.save deleteCategory');
                                                    }
                                                    else {
                                                        console.log('到了删除cateogory这步了');


                                                            subsubcb(null, true);


                                                    }
                                                });
                                            }
                                        },
                                        function(deleteStatus, subsubcb){

                                            if(deleteStatus == true){
                                                var selectCategorySQL = 'SELECT * FROM CATEGORY_LIST WHERE username = ? AND category = ?';
                                                //console.log('selectedPost.category : '+selectedCategory.category);
                                                db.query(selectCategorySQL, [username, selectedCategory.category], function (err, results) {
                                                    if (err) {
                                                        console.log(err);
                                                        console.log('err happens in Post.save selectCategory');
                                                    }
                                                    else {
                                                        //写到这里了
                                                        if(results.length > 0){
                                                            console.log('还有这个分类呢');
                                                            subsubcb(null, true);
                                                        }else{
                                                            console.log('没有这个分类了');
                                                            subsubcb(null, false);
                                                        }




                                                    }
                                                });
                                            }
                                        },
                                        function(selectStatus, subsubcb){

                                            if(selectStatus == false){
                                                var insertCategorySQL = 'INSERT INTO CATEGORY_LIST SET ?';
                                                db.query(insertCategorySQL, {username:username, category:selectedCategory.category}, function (err, results) {
                                                    if (err) {
                                                        console.log(err);
                                                        console.log('err happens in Post.save deleteCategory');
                                                    }
                                                    else {
                                                        //写到这里了
                                                        if(typeof(results.insertId)=='undefined'){
                                                            subcb(null, false);
                                                        }
                                                        else{
                                                            console.log('到为分类博文这一步了');
                                                            subcb(null, true);
                                                        }
                                                    }
                                                });
                                            }else{
                                                subcb(null, true);
                                            }
                                        }
                                    ]);
                                    /*
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
                                    });*/
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
                                                if(updateData.tag[0]!= ""){
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
                                                }else{
                                                    subsubcb(null, true);
                                                }


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
                                 res.json({status:true});
                                    res.end();
                                    console.log(title);
                                    console.log(updateData.title);
                                } else {
                                    res.json({status:false});
                                    res.end();
                                    console.log('这是最终的结果 ' + results);
                                    console.log('博文修改失败');
                                }
                            });


                    }else{res.json({status:false});
                            res.end();
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



/*
router.post('/newcategory', function(req, res, next){
    if((req.session.username == req.params.username)){
        console.log(req.params);
        console.log(req.body);
        var username = req.params.username;
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
                        insertSQL,{username:username , category:category},
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
*/

module.exports = router;
