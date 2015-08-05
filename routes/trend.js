var express = require('express');
var router = express.Router({ mergeParams: true});
var clone = require('clone');
var async = require('async');
var getContent = require('./lib/getContent');
var markdown = require('markdown');
var db = require('../models/db');

router.get('/', function(req, res, next){
async.parallel(
    {
        hotUser : function(callback){
            var selectHotUserSQL = 'SELECT username, SUM(pageview) as totalPageView FROM POST_LIST GROUP BY username ORDER BY totalPageView DESC LIMIT 1';
            db.query(selectHotUserSQL,function(err, results){
                if(err){
                    console.log(err);
                    console.log('Err happens in routes/trend.js selectHotUser');
                    callback(null, false);
                }else{
                    console.log('hotUser result : '+ results[0].username);
                    callback(null, results[0]);
                }
            });
        },
        hotPost : function(callback){
            var selectHotUserSQL = 'SELECT * FROM POST_LIST ORDER BY pageview DESC LIMIT 1';
            db.query(selectHotUserSQL,function(err, results){
                if(err){
                    console.log(err);
                    console.log('Err happens in routes/trend.js selectHotPost');
                    callback(null, false);
                }else{
                    console.log('hotPost result : '+ results[0]);
                    callback(null, results[0]);
                }
            });
        },
        newestPost : function(callback){
            var selectHotUserSQL = 'SELECT * FROM POST_LIST  ORDER BY realtime DESC LIMIT 1';
            db.query(selectHotUserSQL,function(err, results){
                if(err){
                    console.log(err);
                    console.log('Err happens in routes/trend.js selectNewestPost');
                    callback(null, false);
                }else{
                    console.log('newestPost result : '+ results[0].title);
                    callback(null, results[0]);
                }
            });
        }

    },function(err, results){
        var hotUser = results.hotUser;
        var hotPost = results.hotPost;
        var newestPost = results.newestPost;
        //console.log(hotPost.title);
        res.render('trend', {
            hotUser : hotUser,
            hotPost : hotPost,
            newestPost : newestPost
        });

    }
);
});
module.exports = router;