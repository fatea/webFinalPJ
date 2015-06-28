var express = require('express');
var router = express.Router({ mergeParams: true});
var clone = require('clone');
var async = require('async');
var getContent = require('./lib/getContent');
var markdown = require('markdown');
var db = require('../models/db');

router.post('/', function(req, res, next){
    var username = req.params.username;

    var originalCategory  = req.params.category;
    var defaultCategory = '未分类博文';
        console.log(req.params);
    if(username == req.session.username){
        if(originalCategory != defaultCategory){
            async.waterfall([
                function(callback){
                    var updateCategorySQL = 'UPDATE CATEGORY_LIST SET category = \''+defaultCategory+'\' WHERE username = ? AND category = ?' ;
                    db.query(updateCategorySQL, [username, originalCategory], function(err, results){
                        if(err){
                            console.log(updateCategorySQL);
                            console.log(err);
                            console.log(' Err happens in routes/deletecategory.js');
                            callback(null, false);
                        } else{
                            if(results.affectedRows > 0){
                                callback(null, true);
                            }else{
                                callback(null, false);
                            }
                        }
                    });
                },
                function(updateStatus, callback){
                    var deleteCategorySQL = 'DELETE FROM CATEGORY_LIST  WHERE username = ? AND category = ? AND postid IS NULL' ;
                    db.query(deleteCategorySQL, [username, defaultCategory], function(err, results){
                        if(err){
                            console.log(deleteCategorySQL);
                            console.log(err);
                            console.log(' Err happens in routes/deletecategory.js');
                            res.json({status : false});
                            res.end();
                        } else{
                            res.json({status : true});
                            res.end();
                        }

                    });
                }
            ]);
        } else {
            res.json({status : false, reason: false});
            res.end();
        }




    }else{
        res.json({status : false});
        res.end();
    }

});

module.exports = router;