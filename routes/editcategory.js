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
    var originalCategory  = req.params.category;
    var newCategory = req.body.category;
    console.log(req.params);
    if(username == req.session.username){
        if(originalCategory != '未分类博文'){
            var updateCategorySQL = 'UPDATE CATEGORY_LIST SET category = \''+newCategory+'\' WHERE username = ? AND category = ?' ;
            db.query(updateCategorySQL, [username, originalCategory], function(err, results){
                if(err){
                    console.log(updateCategorySQL);
                    console.log(err);
                    console.log(' Err happens in routes/editcategory.js');
                } else{
                    if(results.affectedRows > 0){
                        res.json({status:true});
                        res.end();
                    }else{
                        res.json({status: false});
                        res.end();
                    }
                }
            });
        }else{
            res.json({status : false, reason:false});
            res.end();
        }


    }else{
        res.json({status : false});
        res.end();
    }

});

module.exports = router;