var express = require('express');
var router = express.Router({ mergeParams: true});
var auth = require('./lib/auth');
var multer  = require('multer');
var db = require('../models/db');
var async = require('async');
router.get('/', auth.pleaseLogin);

router.get('/', function(req, res, next){
    if(req.params.username == req.session.username){
        res.render('profile',{
            username:req.session.username
        });
    }
    else{
        next();
    }
});

router.post('/',

    multer({ dest: './public/images/avatars/',
        onFileUploadStart:function(file,req,res){
            //console.log(req.params.username);
            console.log("upload start");
        },
        //上传结束时触发
        onFileUploadComplete:function(file, req, res){

            console.log(req.body);

                    var editProfileSQL = 'UPDATE USER_LIST SET ? WHERE username = "' + req.session.username+'"';
                    db.query(editProfileSQL, {password:req.body.newPassword, avatar :'/images/avatars/'+req.session.username+'.png'}, function(err, results){
                            if(err){
                                console.log(err);

                                console.log('Err happens in routes/profile.js editProfileSQL');
                            }else{
                                console.log("upload complete");
                                console.log(results.affectedRows);
                                res.redirect('/'+req.session.username+'/index');
                            }
                        }
                    );



            //console.log(req.session.username);
        },

        rename : function(fieldname ,filename, req, res){

            console.log('这里是params: '+req.session.username);
            return req.session.username;
        }

    }),
    function(req, res, next){

        //console.log(isConcrete(req.files));
        if(typeof(req.files.newAvatar) == 'undefined'){
            var editPasswordSQL = 'UPDATE USER_LIST SET ? WHERE username = "' + req.session.username+'"';
            db.query(editPasswordSQL, {password:req.body.newPassword}, function(err, results){
                    if(err){
                        console.log(err);

                        console.log('Err happens in routes/profile.js editPasswordSQL');
                    }else{
                        console.log("upload complete");
                        console.log(results.affectedRows);
                        res.redirect('/'+req.session.username+'/index');
                    }
                }
            );
        }

    /*
    if(req.file){
    onFileUploadComplete: function (file, req, res) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
    }
    }*/


});


module.exports = router;