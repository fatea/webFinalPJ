var express = require('express');
var router = express.Router({ mergeParams: true});
var clone = require('clone');
var async = require('async');
var getContent = require('./lib/getContent');
var markdown = require('markdown');
var db = require('../models/db');

router.post('/', function(req, res, next){
    var username = req.params.username;
    var date = req.params.date;
    var title = req.params.title;
    console.log(req.params);
    if(username == req.session.username){
        async.waterfall(
            [   function(callback){
                var selectPostSQL = 'SELECT * FROM POST_LIST WHERE username = ? AND date = ? AND title = ?';
                db.query(selectPostSQL, [username, date, title], function(err, results){
                    if(err){
                        console.log(err);
                        console.log('Err happens in routes/deletepost.js selectPost');
                    }else{
                        if(results.length > 0){
                            //console.log('进入selectPost');
                            callback(null, results[0].postid);
                        }else{
                            callback(null, false);
                        }
                    }
                });
            },
                function(postid,callback){
                    if(postid != false){
                        var deletePostSQL = 'DELETE FROM POST_LIST WHERE username = ? AND postid = ?';
                        db.query(deletePostSQL, [username, postid], function(err, results){
                            if(err){
                                console.log(err);
                                console.log('Err happens in routes/deletepost.js deletePost');
                            }else{
                                if(results.affectedRows > 0){
                                    //console.log('进入deletePost');
                                    callback(null, postid);
                                }else{
                                    callback(null, false);
                                }
                            }
                        });
                    }else{
                        callback(null, false);
                    }
                },
                function(postid, callback){
                    if(postid != false){
                        var deleteTagSQL = 'DELETE FROM TAG_LIST WHERE username = ? AND postid = ?';
                        db.query(deleteTagSQL, [username, postid], function(err, results){
                            if(err){
                                console.log(err);
                                console.log('Err happens in routes/deletepost.js deleteTag');
                            }else{
                                if(results.affectedRows > 0){
                                    //console.log('进入deleteTag');
                                    callback(null, postid);
                                }else{
                                    callback(null, false);
                                }
                            }
                        });
                    }else{
                        callback(null, false);
                    }
                },
                function(postid, callback){
                    if(postid != false){


                        async.waterfall([
                           function(subcb){
                               var selectCategorySQL = 'SELECT * FROM CATEGORY_LIST WHERE username = ? AND postid = ?';
                               db.query(selectCategorySQL, [username, postid], function(err, results){
                                   if(err){
                                       console.log(err);
                                       console.log('Err happens in routes/deletepost.js deletePost');
                                   }else{
                                       if(results.length > 0){
                                           //console.log('进入selectCategory');
                                           subcb(null, results[0].category);
                                       }else{
                                           subcb(null, false);
                                       }
                                   }
                               });
                           },
                                function(category, subcb){
                                    if (category != false) {
                                        console.log(category);

                                        var deleteSQL = 'DELETE FROM CATEGORY_LIST WHERE postid = ? AND username = ? AND category = ?';
                                        db.query(deleteSQL, [postid, username, category], function (err, results) {
                                            if (err) {
                                                console.log(err);
                                                console.log('err happens in Post.save deleteCategory');
                                            }
                                            else {

                                                //console.log('到了删除cateogory这步了');
                                                if(results.affectedRows > 0){
                                                    //console.log('进入deletCategory');
                                                subcb(null, category);}
                                                else{
                                                    subcb(null, false);
                                                }
                                                }

                                        });
                                    }
                                },
                                function(category, subcb){

                                    if(category != false){
                                        var selectCategorySQL = 'SELECT * FROM CATEGORY_LIST WHERE username = ? AND category = ?';
                                        //console.log('selectedPost.category : '+selectedCategory.category);
                                        db.query(selectCategorySQL, [username, category], function (err, results) {
                                            if (err) {
                                                console.log(err);
                                                console.log('err happens in routes/deletepost.js selectCategory');
                                            }
                                            else {
                                                //写到这里了
                                                if(results.length > 0){
                                                    //console.log('还有这个分类呢');
                                                    //console.log('进入selectCategory 还有这个分类呢');
                                                    subcb(null, false);
                                                }else{
                                                    //console.log('进入selectCategory 没有这个分类了');
                                                    //console.log('没有这个分类了');
                                                    subcb(null, category);
                                                }




                                            }
                                        });
                                    }
                                },
                                function(category, subcb){

                                    if(category != false){
                                        var insertCategorySQL = 'INSERT INTO CATEGORY_LIST SET ?';
                                        db.query(insertCategorySQL, {username:username, category:category}, function (err, results) {
                                            if (err) {
                                                console.log(err);
                                                console.log('err happens in Post.save deleteCategory');
                                            }
                                            else {
                                                //写到这里了
                                                if(typeof(results.insertId)=='undefined'){
                                                    res.json({status:false});
                                                    res.end();
                                                }
                                                else{
                                                    //console.log('到为分类博文这一步了');
                                                    res.json({status:true});
                                                    res.end();
                                                }
                                            }
                                        });}else{
                                        //console.log('进入最后一步');
                                        res.json({status:true});
                                        res.end();
                                    }}

                        ]);
                    }else{
                        res.json({status:false});
                        res.end();
                    }
                }
            ]
        );

    }
});

module.exports = router;