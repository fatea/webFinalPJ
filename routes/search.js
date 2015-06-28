var express = require('express');
var router = express.Router({ mergeParams: true});
var clone = require('clone');
var async = require('async');
var getContent = require('./lib/getContent');
var markdown = require('markdown');
var db = require('../models/db');

router.post('/', function(req, res, next) {
    var scope = req.body.scope;
    var searchUsername = req.body.searchUsername;
    var keywordPlace = req.body.keywordPlace;
    var orderBy = req.body.orderBy;
    var order = req.body.order;
    var searchKeyword = req.body.searchKeyword;
    console.log(req.params);
    console.log(req.body);
    console.log(req.body.searchUsername.length);

    if(scope == 'singleUser'){
        async.waterfall([
            function(callback){
                if(keywordPlace == 'inTitle'){
                    var selectInTitleSQL = 'SELECT * FROM POST_LIST WHERE username = ? AND BINARY title LIKE ? ORDER BY '+orderBy+' '+ order;
                    db.query(selectInTitleSQL, [searchUsername,'%'+searchKeyword+'%'], function(err, results){
                        if(err){
                            console.log(err);
                            console.log('Err happens in routes/search.js selectInTitle');
                            callback(null, false);
                        }else{
                            if(results.length > 0){
                                    console.log(selectInTitleSQL);
                                callback(null, results);

                            }else{
                                callback(null, false);
                            }
                        }
                    });
                }else if(keywordPlace == 'inContent'){
                    var selectInContentSQL = 'SELECT * FROM POST_LIST WHERE username = ? AND BINARY content LIKE ? ORDER BY '+orderBy+' '+ order;
                    db.query(selectInContentSQL, [searchUsername,'%'+searchKeyword+'%'], function(err, results){
                        if(err){
                            console.log(err);
                            console.log('Err happens in routes/search.js selectInTitle');
                            callback(null, false);
                        }else{
                            if(results.length > 0){

                                callback(null, results);

                            }else{
                                callback(null, false);
                            }
                        }
                    });
                }else if(keywordPlace == 'inTag'){
                    var selectInTagOrderBy = 'POST_LIST.'+orderBy;
                    var selectInTagSQL = 'SELECT * FROM POST_LIST ' +
                        'INNER JOIN TAG_LIST ' +
                        'ON POST_LIST.postid = TAG_LIST.postid ' +
                        'WHERE POST_LIST.username = ? AND BINARY TAG_LIST.tag LIKE ? ORDER BY '+selectInTagOrderBy+' '+ order;
                    db.query(selectInTagSQL, [searchUsername,'%'+searchKeyword+'%'], function(err, results){
                        if(err){
                            console.log(err);
                            console.log('Err happens in routes/search.js selectInTitle');
                            callback(null, false);
                        }else{
                            if(results.length > 0){

                                callback(null, results);

                            }else{
                                callback(null, false);
                            }
                        }
                    });
                }
            },
            function(selectedPost, callback){
                if(selectedPost != false){
                console.log(selectedPost);
                    var hrefArr = [];
                    var titleArr = [];
                    var timeArr = [];
                    for(var i = 0; i<selectedPost.length;i++){
                        titleArr[i] = selectedPost[i].title;
                        timeArr[i] = selectedPost[i].time;
                        hrefArr[i] = '/'+selectedPost[i].username+'/'+selectedPost[i].date+'/'+selectedPost[i].title;
                    }

                    res.render('search', {
                        postDataLength:selectedPost.length,
                        hasPost:true,
                        hrefArr : hrefArr,
                        titleArr:titleArr,
                        timeArr:timeArr
                    });
                }else{
                    res.render('search',{
                        hasPost:false
                    });
                }

            }
        ]);

    }else if(scope == 'allUser'){
        async.waterfall([
            function(callback){
                if(keywordPlace == 'inTitle'){
                    var selectInTitleSQL = 'SELECT * FROM POST_LIST WHERE BINARY title LIKE ? ORDER BY '+orderBy+' '+ order;
                    db.query(selectInTitleSQL, ['%'+searchKeyword+'%'], function(err, results){
                        if(err){
                            console.log(err);
                            console.log('Err happens in routes/search.js selectInTitle');
                            callback(null, false);
                        }else{
                            if(results.length > 0){
                                console.log(selectInTitleSQL);
                                callback(null, results);

                            }else{
                                callback(null, false);
                            }
                        }
                    });
                }else if(keywordPlace == 'inContent'){
                    var selectInContentSQL = 'SELECT * FROM POST_LIST WHERE BINARY content LIKE ? ORDER BY '+orderBy+' '+ order;
                    db.query(selectInContentSQL, ['%'+searchKeyword+'%'], function(err, results){
                        if(err){
                            console.log(err);
                            console.log('Err happens in routes/search.js selectInTitle');
                            callback(null, false);
                        }else{
                            if(results.length > 0){

                                callback(null, results);

                            }else{
                                callback(null, false);
                            }
                        }
                    });
                }else if(keywordPlace == 'inTag'){
                    var selectInTagOrderBy = 'POST_LIST.'+orderBy;
                    var selectInTagSQL = 'SELECT * FROM POST_LIST ' +
                        'INNER JOIN TAG_LIST ' +
                        'ON POST_LIST.postid = TAG_LIST.postid ' +
                        'WHERE TAG_LIST.tag = ? AND TAG_LIST.postid IS NOT NULL ORDER BY '+selectInTagOrderBy+' '+ order;
                    db.query(selectInTagSQL, [searchKeyword], function(err, results){
                        if(err){
                            console.log(err);
                            console.log('Err happens in routes/search.js selectInTitle');
                            callback(null, false);
                        }else{
                            if(results.length > 0){

                                callback(null, results);

                            }else{
                                callback(null, false);
                            }
                        }
                    });
                }
            },
            function(selectedPost, callback){
                if(selectedPost != false){
                    console.log(selectedPost);
                    var hrefArr = [];
                    var titleArr = [];
                    var timeArr = [];
                    for(var i = 0; i<selectedPost.length;i++){
                        titleArr[i] = selectedPost[i].title;
                        timeArr[i] = selectedPost[i].time;
                        hrefArr[i] = '/'+selectedPost[i].username+'/'+selectedPost[i].date+'/'+selectedPost[i].title;
                    }

                    res.render('search', {
                        postDataLength:selectedPost.length,
                        hasPost:true,
                        hrefArr : hrefArr,
                        titleArr:titleArr,
                        timeArr:timeArr
                    });
                }else{
                    res.render('search',{
                        hasPost:false
                    });
                }

            }
        ]);
    }


});

module.exports = router;